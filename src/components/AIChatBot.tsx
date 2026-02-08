import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, MessageSquare, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import type { Service, Category, StoreSettings } from '../types/database';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

/* =====================
   إعدادات Groq API
===================== */

const GROQ_API_KEY = "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";

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
            const { data: products } = await supabase
                .from('services')
                .select(`*, category:categories(*), sizes:product_sizes(*)`)
                .order('created_at', { ascending: false });

            const { data: categories } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            const { data: storeSettings } = await supabase
                .from('store_settings')
                .select('*')
                .single();

            setStoreData({
                products: products || [],
                categories: categories || [],
                storeSettings: storeSettings || null
            });
        } catch (error) {
            console.error(error);
        }
    };

    const generateStoreContext = () => {
        const { products, storeSettings } = storeData;
        let context = `أنت مساعد ذكي لمعرض "${storeSettings?.store_name || 'معرض السماح - فوربيد'}".\n\n`;

        if (products.length > 0) {
            context += `المنتجات المتاحة:\n`;
            products.forEach(product => {
                const productUrl = `https://alsamah-store.com/product/${product.id}`;
                context += `\n--- ${product.title} ---\n`;
                context += `الوصف: ${product.description || 'لا يوجد وصف'}\n`;

                if (product.has_multiple_sizes && product.sizes?.length) {
                    const prices = product.sizes.map(s => parseFloat(s.sale_price || s.price)).filter(Boolean);
                    const min = Math.min(...prices);
                    context += `السعر: ابتداءً من ${min} ج.م\n`;
                    context += `المقاسات: ${product.sizes.map(s => s.size).join(', ')}\n`;
                } else {
                    if (product.sale_price) context += `السعر بعد الخصم: ${product.sale_price} ج.م\n`;
                    else if (product.price) context += `السعر: ${product.price} ج.م\n`;
                }

                context += `الرابط: ${productUrl}\n`;
            });
        }

        context += `
التعليمات:
- رد مختصر وبالعامية المصرية.
- عند اقتراح منتج ضع رابطه فورًا.
- لا تستخدم جداول.
- استخدم زر عرض المنتج.
- شجع العميل على السؤال.
`;

        return context;
    };

    /* =====================
       Groq API Integration
    ===================== */

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

            return data?.choices?.[0]?.message?.content ||
                "معلش، مافهمتش سؤالك، ممكن توضّح أكتر؟";

        } catch (error) {
            console.error(error);
            return "⚠️ حصل خطأ تقني.";
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        const aiResponse = await sendToAI(userMessage.text);

        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    text: aiResponse,
                    isUser: false,
                    timestamp: new Date()
                }
            ]);
            setIsLoading(false);
        }, 400);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 p-4 rounded-full shadow-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 z-50"
            >
                <MessageCircle className="h-6 w-6" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="fixed bottom-24 left-6 w-80 h-96 bg-black/90 rounded-2xl border border-white/20 z-50 flex flex-col"
                    >
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesContainerRef}>
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`rounded-xl px-3 py-2 max-w-[85%] ${msg.isUser ? 'bg-green-600 text-white' : 'bg-white/10 text-white'}`}>
                                        <RenderMessageWithLinks text={msg.text} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-3 border-t border-white/20 flex gap-2">
                            <input
                                ref={inputRef}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1 rounded-full px-4 bg-white/10 text-white"
                                placeholder="اكتب سؤالك..."
                            />
                            <button
                                onClick={handleSendMessage}
                                className="bg-green-600 p-2 rounded-full text-white"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
