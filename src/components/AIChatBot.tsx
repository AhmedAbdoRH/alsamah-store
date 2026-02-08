import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, MessageSquare, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- ملاحظة: تم إزالة الاستيراد الخارجي لتجنب خطأ التجميع ---
// في بيئتك المحلية، تأكد من وجود مكتبة @supabase/supabase-js
// يمكنك استيرادها هكذا: import { createClient } from '@supabase/supabase-js'

// --- تعريف الأنواع (Interfaces) ---
interface ProductSize {
    id: string;
    size: string;
    price: number | string;
    sale_price?: number | string;
}

interface Category {
    id: string;
    name: string;
}

interface Service {
    id: string;
    title: string;
    description: string;
    price: number;
    sale_price?: number;
    has_multiple_sizes: boolean;
    category?: Category;
    sizes?: ProductSize[];
}

interface StoreSettings {
    store_name: string;
}

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

// =====================
// إعدادات Groq API
// =====================
const GROQ_API_KEY = "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"; // ضع مفتاح Groq الخاص بك هنا (سيتم استخدامه تلقائياً في البيئة)
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-120b"; 
// =====================
// إعدادات Supabase (تأكد من استبدالها ببياناتك الحقيقية)
// =====================
// const SUPABASE_URL = "YOUR_SUPABASE_URL";
// const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
                if (i % 3 === 2) {
                    return null;
                }
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

    // محاكاة جلب البيانات إذا لم يتوفر Supabase في هذه البيئة
    const fetchStoreData = async () => {
        try {
            // ملاحظة للمستخدم: هنا نضع الكود الفعلي لجلب البيانات من Supabase
            // سنستخدم حالياً بيانات تجريبية (Mock) لضمان عدم توقف التطبيق عن العمل (Compilation)
            // في مشروعك الفعلي، استخدم: const { data } = await supabase.from('services').select('...')
            
            console.log("جاري محاولة جلب البيانات من قاعدة البيانات...");
            
            // بيانات افتراضية لضمان عمل "ذكاء" البوت في المعاينة
            const mockProducts: Service[] = [
                {
                    id: "101",
                    title: "طقم لحاف فوربيد فندقي",
                    description: "لحاف قطن 100% ناعم جداً ومناسب لجميع الفصول",
                    price: 3500,
                    sale_price: 2900,
                    has_multiple_sizes: true,
                    category: { id: "1", name: "ألحفة" },
                    sizes: [
                        { id: "s1", size: "240x260", price: 3500, sale_price: 2900 },
                        { id: "s2", size: "180x220", price: 2800, sale_price: 2400 }
                    ]
                },
                {
                    id: "102",
                    title: "مرتبة فوربيد سوبر لوكس",
                    description: "مرتبة طبية مريحة مع ضمان 10 سنوات",
                    price: 5000,
                    has_multiple_sizes: false,
                    category: { id: "2", name: "مراتب" }
                }
            ];

            setStoreData({
                products: mockProducts,
                categories: [{ id: "1", name: "ألحفة" }, { id: "2", name: "مراتب" }],
                storeSettings: { store_name: "معرض السماح - فوربيد" }
            });
        } catch (error) {
            console.error('Error fetching store data:', error);
        }
    };

    useEffect(() => {
        if (isOpen && storeData.products.length === 0) {
            fetchStoreData();
        }
    }, [isOpen]);

    const generateStoreContext = () => {
        const { products, storeSettings } = storeData;
        let context = `أنت مساعد ذكي مبيعات خبير لمعرض "${storeSettings?.store_name || 'معرض السماح'}".\n\n`;
        
        context += `البيانات الحقيقية المتاحة حالياً من المتجر:\n`;
        if (products.length > 0) {
            products.forEach(p => {
                const url = `https://alsamah-store.com/product/${p.id}`;
                context += `▫️ ${p.title}\n`;
                context += `  - الوصف: ${p.description}\n`;
                context += `  - الفئة: ${p.category?.name || 'عام'}\n`;
                
                if (p.has_multiple_sizes && p.sizes) {
                    context += `  - المقاسات المتاحة:\n`;
                    p.sizes.forEach(s => {
                        context += `    * مقاس ${s.size}: سعره ${s.sale_price || s.price} ج.م\n`;
                    });
                } else {
                    context += `  - السعر: ${p.sale_price || p.price} ج.م\n`;
                }
                context += `  - الرابط المباشر: ${url}\n\n`;
            });
        } else {
            context += `(لا توجد منتجات مسجلة حالياً في قاعدة البيانات)\n`;
        }

        context += `تعليمات الرد:
1. اتكلم بالعامية المصرية الودودة وباحترافية.
2. لما العميل يسأل عن منتج، اذكر ميزته الأساسية وسعره (لو فيه خصم قوله).
3. استعمل دايماً زر عرض المنتج بالتنسيق ده: [اسم المنتج](الرابط).
4. لو العميل سأل عن "أكبر مقاس" أو "أرخص حاجة"، حلل الأسعار اللي فوق ورد بدقة.
5. لا تذكر رقم الواتساب (01027381559) إلا لو العميل طلب يتواصل مع الإدارة.
6. ختام الرد دايماً يكون مشجع: "لو محتاج تسأل عن حاجة تانية أنا معاك يا فندم."
7. ممنوع تطلع بره البيانات اللي في القائمة فوق.`;

        return context;
    };

    const sendToAI = async (currentMessages: Message[]): Promise<string> => {
        const systemPrompt = generateStoreContext();
        const history = currentMessages.slice(-5).map(m => ({
            role: m.isUser ? "user" : "assistant",
            content: m.text
        }));

        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: GROQ_MODEL,
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...history
                    ],
                    temperature: 0.5, // تقليل الحرارة لزيادة الدقة في الأسعار
                    max_tokens: 800
                })
            });

            const data = await response.json();
            return data.choices[0]?.message?.content?.trim() || 'بعتذر يا فندم، واجهت مشكلة بسيطة. ممكن تسألني تاني؟';
        } catch (error) {
            return '⚠️ عذراً، فيه مشكلة تقنية في التواصل مع الذكاء الاصطناعي.';
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), text: inputText.trim(), isUser: true, timestamp: new Date() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputText('');
        setIsLoading(true);

        const aiResponse = await sendToAI(newMessages);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiResponse, isUser: false, timestamp: new Date() }]);
        setIsLoading(false);
    };

    useEffect(() => {
        messagesContainerRef.current?.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="relative font-sans">
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 p-4 rounded-full shadow-2xl bg-gradient-to-br from-emerald-500 to-green-700 text-white z-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <MessageCircle size={24} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 left-6 w-80 h-[450px] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        <div className="p-4 bg-zinc-900 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-white font-bold text-sm">مساعد السماح الذكي</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
                        </div>

                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map(m => (
                                <div key={m.id} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] ${m.isUser ? 'bg-emerald-600 text-white' : 'bg-white/5 text-white border border-white/10'}`}>
                                        <RenderMessageWithLinks text={m.text} />
                                    </div>
                                </div>
                            ))}
                            {isLoading && <div className="text-emerald-500 text-[10px] animate-pulse">جاري فحص المنتجات...</div>}
                        </div>

                        <div className="p-3 bg-zinc-900/50">
                            <div className="flex gap-2">
                                <input
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="اسأل عن مقاس أو سعر..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-emerald-500 transition-colors"
                                />
                                <button onClick={handleSendMessage} className="p-2 bg-emerald-600 rounded-xl text-white hover:bg-emerald-500 transition-colors">
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
