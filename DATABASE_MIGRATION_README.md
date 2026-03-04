# 🚀 نقل قاعدة البيانات - Database Migration

أداة شاملة لنقل محتوى قاعدة البيانات من Supabase إلى قاعدة بيانات أخرى.

## ⚡ البدء السريع

### الطريقة الأسهل - التفاعلية

```bash
npm run migrate:interactive
```

ستُطلب منك إدخال بيانات قاعدتي البيانات، وسيتم نقل جميع البيانات تلقائياً.

### الطريقة الثانية - باستخدام ملف البيئة

```bash
# 1. أنشئ ملف .env.migration
cp .env.migration.example .env.migration

# 2. عدّل الملف بإضافة بيانات قاعدتي البيانات
# 3. شغّل النقل
npm run migrate
```

## 📋 ما الذي يتم نقله؟

- ✅ categories (الفئات)
- ✅ subcategories (الفئات الفرعية)
- ✅ services (الخدمات/المنتجات)
- ✅ product_images (صور المنتجات)
- ✅ product_sizes (الأحجام والأسعار)
- ✅ banners (البانرات)
- ✅ store_settings (إعدادات المتجر)
- ✅ testimonials (آراء العملاء)

## 📚 الأدلة المتاحة

| الدليل | الوصف |
|--------|-------|
| [QUICK_MIGRATION.md](./QUICK_MIGRATION.md) | البدء السريع ⭐ |
| [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) | دليل شامل |
| [SETUP_TARGET_DATABASE.md](./SETUP_TARGET_DATABASE.md) | إعداد قاعدة البيانات الهدف |
| [VERIFY_MIGRATION.md](./VERIFY_MIGRATION.md) | التحقق من النقل |
| [SWITCH_DATABASE.md](./SWITCH_DATABASE.md) | تبديل الموقع |
| [MIGRATE_IMAGES.md](./MIGRATE_IMAGES.md) | نقل الصور |
| [ROLLBACK_MIGRATION.md](./ROLLBACK_MIGRATION.md) | الرجوع للخلف |
| [MIGRATION_INDEX.md](./MIGRATION_INDEX.md) | فهرس شامل |

## 🔐 الأمان

- استخدم **Service Role Keys** فقط
- **لا تشارك** ملف `.env.migration`
- **احذف** الملف بعد انتهاء النقل
- احتفظ بنسخة احتياطية

## ❓ الأسئلة الشائعة

**س: من أين أبدأ؟**
ج: شغّل `npm run migrate:interactive` واتبع التعليمات.

**س: كم من الوقت يستغرق؟**
ج: عادة من ثوانٍ إلى دقائق.

**س: هل يمكن الرجوع للخلف؟**
ج: نعم، اقرأ [ROLLBACK_MIGRATION.md](./ROLLBACK_MIGRATION.md).

**س: ماذا لو حدث خطأ؟**
ج: اقرأ الدليل المناسب لاستكشاف الأخطاء.

## 🎯 خطوات النقل

1. **التحضير** - اقرأ [SETUP_TARGET_DATABASE.md](./SETUP_TARGET_DATABASE.md)
2. **النقل** - شغّل `npm run migrate:interactive`
3. **التحقق** - اتبع [VERIFY_MIGRATION.md](./VERIFY_MIGRATION.md)
4. **التبديل** - اتبع [SWITCH_DATABASE.md](./SWITCH_DATABASE.md)
5. **النشر** - نشّر التحديثات

## 📞 الدعم

- اقرأ الأدلة أولاً
- تحقق من السجلات (logs)
- اتبع استكشاف الأخطاء
- جرّب الرجوع للخلف إذا لزم الأمر

---

**ملاحظة:** جميع الأدوات والأدلة جاهزة للاستخدام الفوري. اختر الطريقة التي تناسبك وابدأ النقل!
