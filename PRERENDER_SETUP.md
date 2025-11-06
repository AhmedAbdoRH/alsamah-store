# إعداد Prerender.io مع Netlify

## الحل المطبق

تم إعداد Prerender.io باستخدام Netlify Edge Functions للتحقق من User-Agent وتوجيه crawlers فقط.

## الملفات المعدلة

1. **`netlify/edge-functions/prerender.ts`** - Edge Function للتحقق من crawlers
2. **`netlify.toml`** - إضافة إعداد Edge Functions
3. **`public/_redirects`** - SPA routing fallback

## الخطوات المطلوبة في Netlify Dashboard

### 1. الوصول إلى Functions tab

**المشكلة:** Functions tab غير موجود مباشرة في القائمة الجانبية!

**الطرق للوصول إلى Functions:**

#### الطريقة الأولى: من Project overview
1. اضغط على **"Project overview"** (المحدد حالياً في القائمة)
2. في الصفحة الرئيسية، ابحث عن تبويبات في الأعلى أو في المحتوى:
   - قد تجد **"Functions"** كتبويب علوي
   - أو في قسم **"Functions & Edge Functions"**

#### الطريقة الثانية: من Project configuration
1. اضغط على **"Project configuration"** من القائمة الجانبية
2. ابحث عن **"Functions"** أو **"Edge Functions"** في القائمة الفرعية

#### الطريقة الثالثة: من Deploys
1. اضغط على **"Deploys"** من القائمة الجانبية
2. افتح آخر deploy
3. ابحث عن قسم **"Functions"** في تفاصيل الـ deploy

#### الطريقة الرابعة: البحث المباشر
- في شريط البحث في Netlify، ابحث عن "Functions" أو "Edge Functions"

### 2. إعادة نشر الموقع أولاً

**الأهم:** قبل أن تبحث عن Functions tab، يجب نشر الموقع أولاً!

1. **رفع التغييرات إلى Git:**
   ```bash
   git add .
   git commit -m "Add Prerender.io Edge Function"
   git push
   ```

2. **انتظار انتهاء البناء:**
   - اذهب إلى **"Deploys"** من القائمة الجانبية
   - انتظر حتى يظهر آخر deploy باللون الأخضر (نجح)
   - يجب أن ترى "Build successful" أو "Deploy successful"

3. **بعد النشر:**
   - Edge Functions ستظهر تلقائياً
   - يمكنك التحقق من Logs في آخر deploy

### 3. التحقق من أن Edge Function تم نشرها

**بدون الوصول إلى Functions tab:**
1. اذهب إلى **"Deploys"** → افتح آخر deploy
2. ابحث في Logs عن كلمة "prerender" أو "Edge Functions"
3. أو اذهب إلى **"Logs"** من القائمة الجانبية
4. ابحث عن أي أخطاء متعلقة بـ Edge Functions

### 3. التحقق من إعدادات Build

اذهب إلى **Build & deploy** → **Build settings**:
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### 4. اختبار التكامل

بعد النشر، اختبر الموقع:

```bash
# اختبار من PowerShell
curl.exe -A "Prerender" "https://alsamah-store.com/" -I
```

يجب أن تحصل على استجابة 200 مع HTML محدد مسبقاً.

### 5. التحقق في Prerender.io

1. اذهب إلى لوحة Prerender.io
2. اضغط **"Verify Integration"**
3. يجب أن ينجح التحقق

## حل المشاكل الشائعة

### إذا لم يعمل التكامل:

1. **تحقق من أن Edge Function تم نشرها:**
   - اذهب إلى **Functions** tab في Netlify
   - يجب أن ترى `prerender` في القائمة

2. **تحقق من Logs:**
   - اذهب إلى **Functions** → **prerender** → **Logs**
   - ابحث عن أي أخطاء

3. **تحقق من التوكن:**
   - تأكد من أن التوكن `V85u5WS8kbxdXKCF5KuR` صحيح في `netlify/edge-functions/prerender.ts`

4. **إذا كنت تستخدم Cloudflare أو CDN آخر:**
   - أضف عناوين IP الخاصة بـ Prerender.io إلى القائمة البيضاء
   - عطّل Bot Fight Mode أو Challenge Mode للـ User-Agent "Prerender"

5. **تحقق من Cache:**
   - امسح cache Netlify
   - اذهب إلى **Deploys** → اختر آخر deploy → **Clear cache and retry deploy**

## عناوين IP الخاصة بـ Prerender.io

إذا كنت تستخدم Cloudflare أو WAF، أضف هذه العناوين إلى القائمة البيضاء:

يمكنك العثور على أحدث عناوين IP من: https://prerender.io/documentation/install-netlify

## ملاحظات مهمة

- Edge Functions تعمل في جميع خطط Netlify (حتى المجانية)
- التكامل يعمل تلقائياً بعد النشر
- لا حاجة لإعدادات إضافية في Netlify Dashboard (بعد النشر الأول)

## الدعم

إذا استمرت المشكلة:
1. تحقق من logs في Netlify Functions
2. تحقق من logs في Prerender.io Dashboard
3. تواصل مع دعم Prerender.io أو Netlify

