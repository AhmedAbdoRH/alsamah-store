# ✅ تم إعداد أدوات نقل قاعدة البيانات

تم إنشاء مجموعة شاملة من الأدوات والأدلة لنقل محتوى قاعدة البيانات من Supabase إلى قاعدة بيانات أخرى.

## 📦 ما تم إنشاؤه

### 1. أدوات النقل (3 ملفات)
```
scripts/
├── migrate-database.js          # سكريبت النقل الأساسي
├── interactive-migrate.js       # أداة تفاعلية سهلة
└── migrate-database.ts          # نسخة TypeScript
```

### 2. ملفات التكوين (1 ملف)
```
.env.migration.example           # مثال على ملف المتغيرات
```

### 3. أدلة التعليمات (8 ملفات)
```
DATABASE_MIGRATION_README.md     # ملف README رئيسي
QUICK_MIGRATION.md               # البدء السريع ⭐
DATABASE_MIGRATION_GUIDE.md      # دليل شامل
SETUP_TARGET_DATABASE.md         # إعداد قاعدة البيانات الهدف
VERIFY_MIGRATION.md              # التحقق من النقل
SWITCH_DATABASE.md               # تبديل الموقع
MIGRATE_IMAGES.md                # نقل الصور والملفات
ROLLBACK_MIGRATION.md            # الرجوع للخلف
MIGRATION_INDEX.md               # فهرس شامل
DATABASE_MIGRATION_SUMMARY.md    # ملخص شامل
```

### 4. تحديثات package.json
```json
"migrate": "node scripts/migrate-database.js",
"migrate:interactive": "node scripts/interactive-migrate.js"
```

## 🚀 كيفية البدء

### الطريقة الأسهل (موصى به)
```bash
npm run migrate:interactive
```

### الطريقة الثانية
```bash
cp .env.migration.example .env.migration
# عدّل الملف بإضافة بيانات قاعدتي البيانات
npm run migrate
```

## 📊 الجداول المنقولة

✅ categories
✅ subcategories
✅ services
✅ product_images
✅ product_sizes
✅ banners
✅ store_settings
✅ testimonials

## 📚 أين تجد المساعدة

| الحالة | الدليل |
|--------|--------|
| أريد البدء السريع | [QUICK_MIGRATION.md](./QUICK_MIGRATION.md) |
| أريد التفاصيل الكاملة | [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) |
| أريد إعداد قاعدة جديدة | [SETUP_TARGET_DATABASE.md](./SETUP_TARGET_DATABASE.md) |
| أريد التحقق من النقل | [VERIFY_MIGRATION.md](./VERIFY_MIGRATION.md) |
| أريد تبديل الموقع | [SWITCH_DATABASE.md](./SWITCH_DATABASE.md) |
| أريد نقل الصور | [MIGRATE_IMAGES.md](./MIGRATE_IMAGES.md) |
| حدثت مشكلة | [ROLLBACK_MIGRATION.md](./ROLLBACK_MIGRATION.md) |
| أريد فهرس شامل | [MIGRATION_INDEX.md](./MIGRATION_INDEX.md) |

## 🎯 خطوات النقل الموصى بها

### 1️⃣ التحضير
- اقرأ [SETUP_TARGET_DATABASE.md](./SETUP_TARGET_DATABASE.md)
- أنشئ مشروع Supabase جديد
- طبّق جميع الهجرات

### 2️⃣ النقل
- شغّل `npm run migrate:interactive`
- أو استخدم `npm run migrate` مع ملف `.env.migration`

### 3️⃣ التحقق
- اتبع [VERIFY_MIGRATION.md](./VERIFY_MIGRATION.md)
- تحقق من جميع البيانات
- اختبر الموقع

### 4️⃣ التبديل
- اتبع [SWITCH_DATABASE.md](./SWITCH_DATABASE.md)
- حدّث ملف `.env`
- أعد تشغيل الخادم

### 5️⃣ النشر
- اختبر محلياً
- نشّر التحديثات
- راقب الموقع

## 🔐 نصائح الأمان المهمة

✅ استخدم **Service Role Keys** فقط (لديها صلاحيات كاملة)
✅ **لا تشارك** ملف `.env.migration` مع أحد
✅ **احذف** الملف بعد انتهاء النقل
✅ **أضفه إلى `.gitignore`** إذا لم يكن موجوداً
✅ احتفظ بنسخة احتياطية من البيانات

## ❓ الأسئلة الشائعة

**س: من أين أحصل على المفاتيح؟**
ج: من Supabase Dashboard → Settings → API → Service Role Key

**س: كم من الوقت يستغرق النقل؟**
ج: عادة من ثوانٍ إلى دقائق حسب حجم البيانات

**س: هل يمكن نقل جدول واحد فقط؟**
ج: نعم، عدّل قائمة الجداول في السكريبت

**س: ماذا لو حدث خطأ؟**
ج: اقرأ [ROLLBACK_MIGRATION.md](./ROLLBACK_MIGRATION.md)

**س: هل البيانات آمنة؟**
ج: نعم، استخدم Service Role Keys وحافظ على سرية المفاتيح

## 📞 الدعم

إذا واجهت مشاكل:

1. **اقرأ الأدلة** - معظم المشاكل موثقة
2. **تحقق من السجلات** - رسائل الخطأ واضحة
3. **اتبع استكشاف الأخطاء** - في كل دليل
4. **جرّب الرجوع للخلف** - إذا لم تتمكن من الحل

## ✨ الخطوات التالية

1. اقرأ [QUICK_MIGRATION.md](./QUICK_MIGRATION.md)
2. شغّل `npm run migrate:interactive`
3. اتبع التعليمات على الشاشة
4. تحقق من البيانات
5. حدّث الموقع
6. نشّر التحديثات

---

## 📋 قائمة التحقق النهائية

- [ ] قرأت [QUICK_MIGRATION.md](./QUICK_MIGRATION.md)
- [ ] أعددت قاعدة البيانات الهدف
- [ ] شغّلت سكريبت النقل
- [ ] تحققت من البيانات
- [ ] حدّثت ملف `.env`
- [ ] أعدت تشغيل الخادم
- [ ] اختبرت الموقع
- [ ] نشّرت التحديثات
- [ ] راقبت الموقع

---

**ملاحظة:** جميع الأدوات والأدلة جاهزة للاستخدام الفوري. اختر الطريقة التي تناسبك وابدأ النقل!

**آخر تحديث:** مارس 2026
**الإصدار:** 1.0.0
**الحالة:** ✅ جاهز للاستخدام
