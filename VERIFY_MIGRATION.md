# التحقق من نقل البيانات

بعد نقل البيانات، اتبع هذه الخطوات للتحقق من نجاح العملية.

## 1. التحقق من عدد السجلات

### عبر Supabase Dashboard

1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر المشروع الجديد
3. اذهب إلى **Table Editor**
4. تحقق من عدد السجلات في كل جدول:

```
categories: _____ سجل
subcategories: _____ سجل
services: _____ سجل
product_images: _____ سجل
product_sizes: _____ سجل
banners: _____ سجل
store_settings: _____ سجل
testimonials: _____ سجل
```

### عبر SQL Query

```sql
SELECT 'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'subcategories', COUNT(*) FROM subcategories
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'product_images', COUNT(*) FROM product_images
UNION ALL
SELECT 'product_sizes', COUNT(*) FROM product_sizes
UNION ALL
SELECT 'banners', COUNT(*) FROM banners
UNION ALL
SELECT 'store_settings', COUNT(*) FROM store_settings
UNION ALL
SELECT 'testimonials', COUNT(*) FROM testimonials;
```

## 2. التحقق من البيانات

### تحقق من الفئات
```sql
SELECT id, name, description FROM categories LIMIT 5;
```

### تحقق من الخدمات
```sql
SELECT id, title, price, sale_price FROM services LIMIT 5;
```

### تحقق من الصور
```sql
SELECT id, image_url FROM product_images LIMIT 5;
```

### تحقق من الأحجام والأسعار
```sql
SELECT id, service_id, size, price FROM product_sizes LIMIT 5;
```

## 3. التحقق من العلاقات

### تحقق من ربط الخدمات بالفئات
```sql
SELECT s.id, s.title, c.name as category_name
FROM services s
LEFT JOIN categories c ON s.category_id = c.id
LIMIT 5;
```

### تحقق من ربط الخدمات بالفئات الفرعية
```sql
SELECT s.id, s.title, sc.name as subcategory_name
FROM services s
LEFT JOIN subcategories sc ON s.subcategory_id = sc.id
WHERE s.subcategory_id IS NOT NULL
LIMIT 5;
```

## 4. اختبار الموقع

### تحديث ملف `.env`

```env
VITE_SUPABASE_URL="https://your-new-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-new-anon-key"
VITE_SUPABASE_SERVICE_ROLE_KEY="your-new-service-role-key"
```

### إعادة تشغيل خادم التطوير

```bash
npm run dev
```

### اختبر الصفحات التالية

- [ ] الصفحة الرئيسية - هل تظهر البيانات؟
- [ ] صفحة المنتجات - هل تظهر جميع المنتجات؟
- [ ] صفحة الخدمات - هل تظهر جميع الخدمات؟
- [ ] صفحة التفاصيل - هل تظهر البيانات الكاملة؟
- [ ] صفحة البحث - هل يعمل البحث؟
- [ ] سلة التسوق - هل تعمل بشكل صحيح؟

## 5. التحقق من الصور

### تحقق من روابط الصور

```sql
SELECT id, image_url FROM services WHERE image_url IS NOT NULL LIMIT 5;
```

- [ ] هل جميع الروابط صحيحة؟
- [ ] هل الصور تحمّل بشكل صحيح؟

## 6. التحقق من الإعدادات

### تحقق من إعدادات المتجر

```sql
SELECT * FROM store_settings LIMIT 1;
```

- [ ] اسم المتجر صحيح؟
- [ ] الشعار يظهر بشكل صحيح؟
- [ ] الألوان والإعدادات صحيحة؟

## 7. قائمة التحقق النهائية

- [ ] جميع الجداول تحتوي على البيانات الصحيحة
- [ ] عدد السجلات متطابق بين قاعدتي البيانات
- [ ] العلاقات بين الجداول سليمة
- [ ] الموقع يعمل بدون أخطاء
- [ ] البيانات تظهر بشكل صحيح
- [ ] الصور تحمّل بشكل صحيح
- [ ] الوظائف تعمل بشكل طبيعي

## 8. استكشاف الأخطاء

### البيانات لا تظهر على الموقع

1. تحقق من ملف `.env`:
```bash
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

2. افتح Developer Console (F12) وتحقق من الأخطاء

3. تحقق من سياسات الأمان (RLS) في Supabase

### الصور لا تحمّل

1. تحقق من روابط الصور في قاعدة البيانات
2. تأكد من أن الصور موجودة في Supabase Storage
3. تحقق من سياسات الوصول للصور

### الأداء بطيء

1. تحقق من حجم البيانات
2. أضف فهارس للأعمدة المستخدمة بكثرة
3. استخدم pagination للبيانات الكبيرة

## 9. المقارنة بين قاعدتي البيانات

### عد السجلات في كلا قاعدتي البيانات

```bash
# قاعدة البيانات القديمة
# قاعدة البيانات الجديدة

# يجب أن تكون الأرقام متطابقة
```

### تحقق من البيانات المفقودة

```sql
-- ابحث عن الخدمات بدون فئة
SELECT id, title FROM services WHERE category_id IS NULL;

-- ابحث عن الخدمات بدون صور
SELECT id, title FROM services WHERE image_url IS NULL;
```

## 10. الخطوات التالية

بعد التحقق من نجاح النقل:

1. ✅ احذف ملف `.env.migration`
2. ✅ احذف قاعدة البيانات القديمة (إذا كنت متأكداً)
3. ✅ نشّر التحديثات إلى الإنتاج
4. ✅ راقب الموقع للتأكد من عدم وجود مشاكل

---

**ملاحظة:** احتفظ بنسخة احتياطية من قاعدة البيانات القديمة لمدة أسبوع على الأقل قبل حذفها.
