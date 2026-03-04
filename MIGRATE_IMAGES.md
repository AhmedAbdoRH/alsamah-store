# نقل الصور والملفات

إذا كنت تستخدم Supabase Storage للصور، اتبع هذه الخطوات لنقل الملفات.

## 1. فهم هيكل التخزين

### الصور المخزنة في Supabase Storage

```
supabase/
├── storage/
│   ├── service-images/
│   ├── product-images/
│   ├── banners/
│   └── testimonials/
```

## 2. نقل الملفات - الطريقة اليدوية

### الخطوة 1: تحميل الملفات من قاعدة البيانات القديمة

```bash
# استخدم Supabase CLI
supabase link --project-ref old-project-ref

# حمّل الملفات
supabase storage download service-images ./backup/service-images
supabase storage download product-images ./backup/product-images
supabase storage download banners ./backup/banners
supabase storage download testimonials ./backup/testimonials
```

### الخطوة 2: رفع الملفات إلى قاعدة البيانات الجديدة

```bash
# ربط المشروع الجديد
supabase link --project-ref new-project-ref

# رفع الملفات
supabase storage upload service-images ./backup/service-images
supabase storage upload product-images ./backup/product-images
supabase storage upload banners ./backup/banners
supabase storage upload testimonials ./backup/testimonials
```

## 3. نقل الملفات - باستخدام سكريبت

### إنشاء سكريبت النقل

```javascript
// scripts/migrate-storage.js
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const sourceClient = createClient(
  process.env.SOURCE_SUPABASE_URL,
  process.env.SOURCE_SUPABASE_KEY
);

const targetClient = createClient(
  process.env.TARGET_SUPABASE_URL,
  process.env.TARGET_SUPABASE_KEY
);

const buckets = ['service-images', 'product-images', 'banners', 'testimonials'];

async function migrateBucket(bucketName) {
  console.log(`📥 تحميل الملفات من ${bucketName}...`);

  try {
    // قائمة الملفات
    const { data: files, error: listError } = await sourceClient
      .storage
      .from(bucketName)
      .list();

    if (listError) throw listError;

    console.log(`✅ وجدت ${files.length} ملف`);

    // تحميل كل ملف
    for (const file of files) {
      try {
        const { data, error: downloadError } = await sourceClient
          .storage
          .from(bucketName)
          .download(file.name);

        if (downloadError) throw downloadError;

        // رفع الملف إلى قاعدة البيانات الجديدة
        const { error: uploadError } = await targetClient
          .storage
          .from(bucketName)
          .upload(file.name, data, { upsert: true });

        if (uploadError) throw uploadError;

        console.log(`✅ تم نقل: ${file.name}`);
      } catch (err) {
        console.error(`❌ خطأ في ${file.name}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`❌ خطأ في ${bucketName}: ${err.message}`);
  }
}

async function main() {
  console.log('🚀 بدء نقل الملفات...\n');

  for (const bucket of buckets) {
    await migrateBucket(bucket);
    console.log('');
  }

  console.log('✨ اكتمل نقل الملفات!');
}

main();
```

## 4. تحديث روابط الصور (إذا لزم الأمر)

إذا تغيرت روابط الصور، قد تحتاج إلى تحديث قاعدة البيانات:

```sql
-- تحديث روابط الخدمات
UPDATE services
SET image_url = REPLACE(image_url, 'old-project.supabase.co', 'new-project.supabase.co')
WHERE image_url LIKE '%old-project.supabase.co%';

-- تحديث روابط البانرات
UPDATE banners
SET image_url = REPLACE(image_url, 'old-project.supabase.co', 'new-project.supabase.co')
WHERE image_url LIKE '%old-project.supabase.co%';
```

## 5. التحقق من الصور

### تحقق من وجود الملفات

```bash
# قائمة الملفات في Supabase Storage
supabase storage list service-images
supabase storage list product-images
```

### اختبر الروابط

1. افتح Supabase Dashboard
2. اذهب إلى **Storage**
3. تحقق من وجود جميع الملفات
4. انسخ رابط ملف واختبره في المتصفح

## 6. سياسات الوصول للملفات

تأكد من أن سياسات الوصول صحيحة:

```sql
-- السماح بالقراءة العامة
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'service-images');

CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');
```

## 7. استكشاف الأخطاء

### الملفات لا تظهر

1. تحقق من وجود الملفات في Storage
2. تحقق من سياسات الوصول
3. تحقق من روابط الملفات في قاعدة البيانات

### الروابط مكسورة

1. تحقق من أن الروابط تشير إلى المشروع الجديد
2. استخدم SQL لتحديث الروابط
3. تحقق من أن الملفات موجودة فعلاً

### الملفات كبيرة جداً

1. استخدم Supabase CLI بدلاً من السكريبت
2. قسّم الملفات إلى مجموعات أصغر
3. استخدم compression إذا أمكن

## 8. الخطوات التالية

بعد نقل الملفات:

1. ✅ تحقق من وجود جميع الملفات
2. ✅ اختبر الروابط في المتصفح
3. ✅ تحقق من أن الصور تظهر على الموقع
4. ✅ احذف الملفات من قاعدة البيانات القديمة (اختياري)

---

**ملاحظة:** احتفظ بنسخة احتياطية من الملفات قبل حذفها من قاعدة البيانات القديمة.
