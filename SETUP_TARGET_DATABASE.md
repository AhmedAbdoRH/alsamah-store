# إعداد قاعدة البيانات الهدف

قبل نقل البيانات، تأكد من أن قاعدة البيانات الهدف جاهزة بنفس الهيكل.

## الخطوة 1: إنشاء مشروع Supabase جديد

1. اذهب إلى [Supabase](https://app.supabase.com)
2. انقر على **New Project**
3. أدخل اسم المشروع
4. اختر كلمة مرور قوية
5. اختر المنطقة الجغرافية
6. انقر **Create new project**

## الخطوة 2: تطبيق الهجرات

بعد إنشاء المشروع، تحتاج إلى تطبيق نفس الهجرات لإنشاء الجداول.

### الطريقة 1: استخدام Supabase CLI (الموصى به)

```bash
# تثبيت Supabase CLI إذا لم يكن مثبتاً
npm install -g supabase

# تسجيل الدخول
supabase login

# ربط المشروع الجديد
supabase link --project-ref your-new-project-ref

# تطبيق الهجرات
supabase db push
```

### الطريقة 2: تطبيق يدوي عبر SQL Editor

1. اذهب إلى Supabase Dashboard
2. اختر المشروع الجديد
3. اذهب إلى **SQL Editor**
4. انسخ محتوى كل ملف من `supabase/migrations/` وشغّله بالترتيب:

```
supabase/migrations/20250101000000_add_subcategory_to_services.sql
supabase/migrations/20250101000001_add_sample_categories.sql
supabase/migrations/20250101000002_add_strip_banner_type.sql
... (وهكذا لجميع الملفات)
```

## الخطوة 3: التحقق من الجداول

بعد تطبيق الهجرات، تحقق من أن جميع الجداول موجودة:

1. اذهب إلى **Table Editor** في Supabase
2. تحقق من وجود الجداول التالية:
   - ✅ categories
   - ✅ subcategories
   - ✅ services
   - ✅ product_images
   - ✅ product_sizes
   - ✅ banners
   - ✅ store_settings
   - ✅ testimonials

## الخطوة 4: إعدادات الأمان (اختياري)

### تفعيل Row Level Security (RLS)

```sql
-- تفعيل RLS على الجداول
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
-- ... وهكذا لجميع الجداول
```

### إنشاء سياسات الوصول

```sql
-- السماح بالقراءة العامة
CREATE POLICY "Allow public read" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Allow public read" ON services
  FOR SELECT USING (true);
```

## الخطوة 5: الحصول على بيانات الاتصال

1. اذهب إلى **Settings** → **API**
2. انسخ:
   - **Project URL**
   - **Anon public key**
   - **Service role key**

ستحتاج هذه البيانات لسكريبت النقل.

## الخطوة 6: التحقق من الاتصال

```bash
# اختبر الاتصال باستخدام السكريبت التفاعلي
npm run migrate:interactive
```

## ملاحظات مهمة

- ✅ تأكد من أن جميع الهجرات تم تطبيقها بنجاح
- ✅ تحقق من أن الجداول فارغة (لا توجد بيانات قديمة)
- ✅ احفظ بيانات الاتصال في مكان آمن
- ⚠️ لا تشارك مفاتيح الخدمة مع أحد

## استكشاف الأخطاء

### خطأ: "Table already exists"
- الجداول موجودة بالفعل، يمكنك المتابعة

### خطأ: "Permission denied"
- تأكد من أنك مسجل دخول بحسابك
- تحقق من صلاحيات المشروع

### الهجرات لم تُطبق
- جرّب الطريقة اليدوية عبر SQL Editor
- تأكد من تطبيق الملفات بالترتيب الصحيح

## الخطوة التالية

بعد إعداد قاعدة البيانات الهدف، اتبع [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) لنقل البيانات.
