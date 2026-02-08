import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, MessageSquare, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase'; // تأكد من أن مسار supabase صحيح
import type { Service, Category, StoreSettings } from '../types/database'; // تأكد من أن مسار الأنواع صحيح

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

// =====================
// إعدادات Groq API (بديل Gemini - مجاني)
// =====================
const GROQ_API_KEY = "PUT_YOUR_API_KEY_HERE";

const RenderMessageWithLinks = ({ text }: { text: string }) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = text.split(linkRegex);

    return (
        <div className="whitespace-pre-wrap font-medium">
            {parts.map((part, i) => {
                if (i % 3 === 1) {
                    const url = parts[i + 1];
                    return (
                        <React.Fragment key={i}>
                            <span>{part}</span>
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 mb-2 flex items-center justify-center gap-2 text-center bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 font-semibold py-1.5 px-3 rounded-lg transition-all border border-emerald-500/50"
                            >
                                <ExternalLink className="w-3 h-3" />
                                عرض المنتج
                            </a>
                        </React.Fragment>
                    );
                }
                if (i % 3 === 2) return null;
                return <span key={i}>{part}</span>;
            })}
        </div>
    );
};

export default function AIChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'أهلاً بيك في معرض السماح - فوربيد 🏠\nازاي أقدر أساعدك في اختيار المفروشات؟',
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [storeData, setStoreData] = useState<{
        products: Service[];
        categories: Category[];
        storeSettings: StoreSettings | null;
    }>({
        products: [],
        categories: [],
        storeSettings: null
    });

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && storeData.products.length === 0) fetchStoreData();
    }, [isOpen]);

    const fetchStoreData = async () => {
        try {
            const { data: products, error: productsError } = await supabase
                .from('services')
                .select(`*, category:categories(*), sizes:product_sizes(*)`)
                .order('created_at', { ascending: false });
            if (productsError) throw productsError;

            const { data: categories, error: categoriesError } = await supabase
                .from('categories')
                .select('*')
                .order('name');
            if (categoriesError) throw categoriesError;

            const { data: storeSettings, error: storeError } = await supabase
                .from('store_settings')
                .select('*')
                .single();
            if (storeError && storeError.code !== 'PGRST116') console.error('Store settings error:', storeError);

            setStoreData({ products: products || [], categories: categories || [], storeSettings: storeSettings || null });
        } catch (error) {
            console.error('Error fetching store data:', error);
        }
    };

    const generateStoreContext = () => {
        const { products, storeSettings } = storeData;
        let context = `أنت مساعد ذكي لمعرض "${storeSettings?.store_name || 'معرض السماح - فوربيد'}".\n\n`;

        if (products.length > 0) {
            context += `المنتجات المتاحة في المعرض:\n`;
            products.forEach(product => {
                const productUrl = `https://alsamah-store.com/product/${product.id}`;
                context += `\n--- ${product.title} ---\n`;
                context += `الوصف: ${product.description || 'لا يوجد وصف متاح'}\n`;

                if (product.has_multiple_sizes && product.sizes && product.sizes.length > 0) {
                    context += `الأسعار المتاحة (متعددة المقاسات):\n`;
                    const sortedSizes = product.sizes.sort((a, b) => {
                        const priceA = parseFloat(a.sale_price as any) || parseFloat(a.price as any);
                        const priceB = parseFloat(b.sale_price as any) || parseFloat(b.price as any);
                        return priceA - priceB;
                    });
                    sortedSizes.forEach(size => {
                        if (size.sale_price) {
                            context += `  - مقاس ${size.size}: ${size.sale_price} ج.م (بعد الخصم) - السعر الأصلي: ${size.price} ج.م\n`;
                        } else {
                            context += `  - مقاس ${size.size}: ${size.price} ج.م\n`;
                        }
                    });
                    context += `  المقاسات المتاحة: ${product.sizes.map(s => s.size).join(', ')}\n`;
                } else {
                    if (product.price) context += `السعر: ${product.price} ج.م\n`;
                    if (product.sale_price) context += `السعر بعد الخصم: ${product.sale_price} ج.م\n`;
                }
                if (product.category?.name) context += `الفئة: ${product.category.name}\n`;
                context += `الرابط للاستخدام في الرد: ${productUrl}\n`;
            });
            context += '\n';
        }

        context += `تعليمات الرد:\n1. كن ودود وتحدث باللهجة المصرية العامية.\n2. اجعل ردودك مختصرة ومباشرة.\n3. عند اقتراح أي منتج، ضع نبذة قصيرة ثم رابطه بصيغة: [النبذة](الرابط).\n4. لا تعرض المنتجات في جداول.\n5. عند ذكر الأسعار المتعددة، اذكر أقل سعر متاح (ابتداءً من).\n6. شجع العميل على السؤال بقول: لو حابب تفاصيل أكتر، أنا موجود يا فندم.\n7. لا تذكر أي معلومات تواصل إلا لو العميل طلب.\n8. استخدم إيموجيز بسيطة.\n9. قبل اسم المنتج ضيف ▫️.\n`;

        return context;
    };

    // ==============================
    // دالة الإرسال الجديدة باستخدام Groq
    // ==============================
    const sendToAI = async (userMessage: string): Promise<string> => {
        const systemPrompt = generateStoreContext();

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama3-70b-8192",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userMessage }
                    ],
                    temperature: 0.6,
                    max_tokens: 900
                })
            });

            const data = await response.json();
            return data?.choices?.[0]?.message?.content || 'معلش، مافهمتش سؤالك، ممكن توضّح أكتر؟';
        } catch (error) {
            console.error('Groq API Error:', error);
            return '⚠️ حصل خطأ تقني.';
        }
    };

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => { if (isOpen) inputRef.current?.focus(); }, [isOpen]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), text: inputText.trim(), isUser: true, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        const aiResponse = await sendToAI(userMessage.text);
        const botMessage: Message = { id: (Date.now() + 1).toString(), text: aiResponse, isUser: false, timestamp: new Date() };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
    };

    return (
        <></>
    );
}
