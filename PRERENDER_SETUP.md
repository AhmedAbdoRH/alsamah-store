# إعداد Prerender.io مع Netlify

## الحل المطبق

تم إعداد **Prerender.io** باستخدام **Netlify Edge Functions**. هذا النظام هو الأكثر استقراراً وموثوقية لأرشفة المواقع التي تعمل بـ JavaScript (مثل React).

## الملفات المعدلة

1. **`netlify/edge-functions/prerender.ts`**: الكود البرمجي الذي يكتشف محركات البحث ويوجهها لـ Prerender.io.
2. **`netlify.toml`**: إعدادات Netlify لتفعيل الـ Edge Functions.

## كيفية التفعيل والتحكم

### 1. التوكن (Token)
بشكل افتراضي، يستخدم الكود التوكن الخاص بك: `V85u5WS8kbxdXKCF5KuR`.
إذا قمت بتغيير التوكن في Prerender.io، يمكنك تحديثه في Netlify Dashboard:
1. اذهب إلى **Site settings** > **Environment variables**.
2. أضف متغيراً باسم `PRERENDER_TOKEN`.
3. ضع التوكن الجديد.

### 2. الخطة المجانية والكمية المستهلكة
- الخطة المجانية تمنحك **250 صفحة شهرياً**.
- **التجديد**: تتجدد هذه الكمية تلقائياً كل شهر في تاريخ اشتراكك.
- **إذا انتهت الكمية**: سيعيد السيرفر خطأ (غالباً 401 أو 402)، وسيقوم الكود تلقائياً بتوجيه الطلب للنسخة العادية من الموقع (بدون Prerender) لضمان عدم توقف الموقع.

### 3. اختبار التكامل
استخدم Terminal (PowerShell) للتأكد:

```powershell
curl.exe -A "Googlebot" "https://alsamah-store.com/" -I
```

يجب أن ترى:
- `x-prerender-engine: Prerender.io`
- `x-prerender-fetch-status: 200` (إذا كانت الكمية متوفرة)

## ملاحظات هامة
- تأكد من عمل **Push** للتغييرات إلى Git.
- يمكنك متابعة الاستهلاك من لوحة تحكم [Prerender.io](https://prerender.io/dashboard).
