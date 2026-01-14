# إعداد Rendertron مع Netlify

## الحل المطبق

تم إعداد **Rendertron** باستخدام **Netlify Edge Functions**. يقوم هذا النظام بالتحقق من "User-Agent" للزائر، وإذا كان محرك بحث (مثل Googlebot)، يتم توجيه الطلب إلى Rendertron لجلب نسخة HTML جاهزة (Prerendered).

## الملفات المعدلة

1. **`netlify/edge-functions/prerender.ts`**: تحتوي على المنطق البرمجي للتحقق من الـ Crawlers وتوجيههم إلى Rendertron.
2. **`netlify.toml`**: إعداد Edge Functions لتعمل على جميع مسارات الموقع.
3. **`public/_redirects`**: ملف التوجيه الخاص بـ Netlify.

## كيفية التفعيل والتحكم

### 1. إعداد رابط Rendertron (اختياري)
بشكل افتراضي، يستخدم الكود الرابط العام: `https://render-tron.app/render`.
إذا كان لديك سيرفر Rendertron خاص بك، يمكنك تعيينه في Netlify Dashboard:
1. اذهب إلى **Site settings** > **Environment variables**.
2. أضف متغيراً جديداً باسم `RENDERTRON_URL`.
3. ضع الرابط الخاص بك (مثلاً: `https://your-rendertron-instance.com/render`).

### 2. الوصول إلى لوحة تحكم Edge Functions
لمتابعة عمل الـ Prerender:
1. في Netlify Dashboard، اذهب إلى تبويب **Logs**.
2. اختر **Edge Functions**.
3. ستظهر لك سجلات (Logs) لكل طلب يتم معالجته بواسطة Rendertron.

### 3. اختبار التكامل
يمكنك التأكد من أن النظام يعمل باستخدام Terminal (PowerShell):

```powershell
# محاكاة محرك بحث Google
curl.exe -A "Googlebot" "https://alsamah-store.com/" -I
```

يجب أن ترى في النتائج:
- `x-prerender: true`
- `x-prerender-engine: Rendertron`

## لماذا استخدمنا Edge Functions؟
- **السرعة**: تتم المعالجة في أقرب سيرفر للزائر (Edge).
- **التحكم الكامل**: يمكننا تحديد من يتم توجيهه للـ Prerender بدقة.
- **التوافق**: يعمل بسلاسة مع تطبيقات React/Vite.

## ملاحظات هامة
- تأكد من نشر التغييرات (Push to Git) لتفعيل الإعدادات الجديدة.
- الـ Edge Functions لا تعمل في البيئة المحلية (Localhost) إلا باستخدام `netlify dev`.
