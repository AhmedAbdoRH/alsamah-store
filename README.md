# PerfumeAmbassador

متجر إلكتروني للعطور مبني باستخدام React + TypeScript + Vite مع Supabase كقاعدة بيانات.

## التقنيات المستخدمة

- React 18
- TypeScript
- Vite
- TailwindCSS
- Supabase (قاعدة البيانات والمصادقة)
- React Router
- Framer Motion
- Lucide React

## التثبيت والتشغيل المحلي

```bash
# تثبيت المكتبات
npm install

# إنشاء ملف .env وإضافة المتغيرات البيئية
cp env.tmp .env

# تشغيل الخادم المحلي
npm run dev
```

## النشر على Vercel

### الخطوة 1: إعداد متغيرات البيئة

في لوحة تحكم Vercel، أضف المتغيرات البيئية التالية:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### الخطوة 2: ربط المستودع

1. سجل دخولك في [Vercel](https://vercel.com)
2. اضغط على "Add New Project"
3. استورد مستودع GitHub الخاص بك
4. Vercel سيكتشف تلقائياً إعدادات Vite من ملف `vercel.json`

### الخطوة 3: النشر

بعد ربط المستودع، سيتم النشر تلقائياً. يمكنك أيضاً:

- النشر من سطر الأوامر:
```bash
npm install -g vercel
vercel
```

- أو استخدام Vercel CLI للنشر اليدوي:
```bash
vercel --prod
```

## الأوامر المتاحة

```bash
npm run dev          # تشغيل الخادم المحلي
npm run build        # بناء المشروع للإنتاج
npm run preview      # معاينة البناء المحلي
npm run lint         # فحص الكود
```

## هيكل المشروع

```
alsamah-store/
├── public/          # الملفات الثابتة
├── src/            # كود المصدر
├── supabase/       # إعدادات Supabase
├── scripts/        # سكريبتات مساعدة
└── vercel.json     # إعدادات Vercel
```

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/AhmedAbdoRH/PerfumeAmbassador)
