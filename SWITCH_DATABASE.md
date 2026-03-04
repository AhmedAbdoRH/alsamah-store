# تبديل الموقع للاتصال بقاعدة البيانات الجديدة

بعد نقل البيانات بنجاح، اتبع هذه الخطوات لتحديث الموقع للاتصال بقاعدة البيانات الجديدة.

## الخطوة 1: تحديث ملف `.env`

افتح ملف `.env` في جذر المشروع وحدّث بيانات Supabase:

```env
# قاعدة البيانات الجديدة
VITE_SUPABASE_URL="https://your-new-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-new-anon-key"
VITE_SUPABASE_SERVICE_ROLE_KEY="your-new-service-role-key"
```

## الخطوة 2: الحصول على المفاتيح الجديدة

1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر المشروع الجديد
3. اذهب إلى **Settings** → **API**
4. انسخ:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon public key** → `VITE_SUPABASE_ANON_KEY`
   - **Service role key** → `VITE_SUPABASE_SERVICE_ROLE_KEY`

## الخطوة 3: إعادة تشغيل خادم التطوير

```bash
# إيقاف الخادم الحالي (Ctrl+C)
# ثم شغّله مجدداً
npm run dev
```

## الخطوة 4: التحقق من الاتصال

1. افتح الموقع في المتصفح: `http://localhost:5173`
2. افتح **Developer Console** (F12)
3. تحقق من عدم وجود أخطاء في الـ Console
4. تحقق من ظهور البيانات بشكل صحيح

## الخطوة 5: بناء النسخة الإنتاجية

```bash
npm run build
```

## الخطوة 6: نشر التحديثات

إذا كنت تستخدم Netlify أو أي منصة أخرى:

1. ادفع التغييرات إلى Git:
```bash
git add .env
git commit -m "Update database connection to new Supabase project"
git push
```

2. تحديث متغيرات البيئة في منصة النشر:
   - اذهب إلى إعدادات المشروع
   - حدّث متغيرات البيئة بنفس القيم من `.env`

## التحقق من النجاح

- ✅ الموقع يحمّل بدون أخطاء
- ✅ البيانات تظهر بشكل صحيح
- ✅ الصور تحمّل بشكل صحيح
- ✅ الوظائف تعمل بشكل طبيعي

## استكشاف الأخطاء

### خطأ: "Missing VITE_SUPABASE_URL"
- تأكد من تحديث ملف `.env`
- أعد تشغيل خادم التطوير

### خطأ: "Permission denied"
- تحقق من أن `VITE_SUPABASE_ANON_KEY` صحيح
- تأكد من سياسات الأمان في Supabase

### البيانات لا تظهر
- تحقق من أن البيانات نُقلت بنجاح
- تحقق من الاتصال بقاعدة البيانات في Supabase Dashboard

## ملاحظات مهمة

- **لا تشارك ملف `.env`** مع أحد
- **أضفه إلى `.gitignore`** إذا لم يكن موجوداً
- استخدم متغيرات البيئة الآمنة في الإنتاج
