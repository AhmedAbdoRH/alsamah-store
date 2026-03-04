# نقل البيانات - البدء السريع

## الطريقة 1: التفاعلية (الأسهل) ✨

```bash
npm run migrate:interactive
```

ستُطلب منك إدخال:
1. رابط Supabase المصدر
2. مفتاح الخدمة للمصدر
3. رابط Supabase الهدف
4. مفتاح الخدمة للهدف

## الطريقة 2: باستخدام ملف البيئة

### 1. أنشئ ملف `.env.migration`:

```bash
cp .env.migration.example .env.migration
```

### 2. عدّل الملف بإضافة بيانات قاعدتي البيانات:

```env
SOURCE_SUPABASE_URL=https://your-source.supabase.co
SOURCE_SUPABASE_KEY=your-source-key
TARGET_SUPABASE_URL=https://your-target.supabase.co
TARGET_SUPABASE_KEY=your-target-key
```

### 3. شغّل النقل:

```bash
npm run migrate
```

## أين أحصل على المفاتيح؟

1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر المشروع
3. اذهب إلى **Settings** → **API**
4. انسخ **Service Role Key** (ليس Anon Key)

## ملاحظات أمان مهمة ⚠️

- **لا تشارك المفاتيح** مع أحد
- **احذف ملف `.env.migration`** بعد انتهاء النقل
- استخدم **Service Role Keys** فقط (لديها صلاحيات كاملة)

## الجداول المنقولة

- ✅ categories (الفئات)
- ✅ subcategories (الفئات الفرعية)
- ✅ services (الخدمات/المنتجات)
- ✅ product_images (صور المنتجات)
- ✅ product_sizes (الأحجام والأسعار)
- ✅ banners (البانرات)
- ✅ store_settings (إعدادات المتجر)
- ✅ testimonials (آراء العملاء)

## استكشاف الأخطاء

| المشكلة | الحل |
|--------|------|
| "Table does not exist" | تأكد من تشغيل الهجرات على قاعدة البيانات الهدف |
| "Permission denied" | استخدم Service Role Key بدلاً من Anon Key |
| "Connection refused" | تحقق من رابط Supabase وأنك متصل بالإنترنت |

## للمزيد من المعلومات

اقرأ [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md)
