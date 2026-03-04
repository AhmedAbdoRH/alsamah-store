# 📚 فهرس أدلة نقل قاعدة البيانات

دليل شامل لجميع الأدلة والأدوات المتاحة.

## 🎯 ابدأ من هنا

### للمستخدمين المستعجلين (5 دقائق)
1. [START_HERE.md](./START_HERE.md) - 3 خطوات فقط
2. [GET_CREDENTIALS.md](./GET_CREDENTIALS.md) - كيفية الحصول على المفاتيح
3. شغّل: `npm run migrate:interactive`

### للمستخدمين الذين يريدون التفاصيل (30 دقيقة)
1. [QUICK_MIGRATION.md](./QUICK_MIGRATION.md) - البدء السريع
2. [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) - دليل شامل
3. [SETUP_TARGET_DATABASE.md](./SETUP_TARGET_DATABASE.md) - إعداد قاعدة جديدة

---

## 📖 جميع الأدلة

### 🚀 البدء والتحضير

| الدليل | الوصف | الوقت |
|--------|-------|-------|
| [START_HERE.md](./START_HERE.md) | ابدأ من هنا - 3 خطوات فقط | 5 دقائق |
| [GET_CREDENTIALS.md](./GET_CREDENTIALS.md) | كيفية الحصول على المفاتيح | 10 دقائق |
| [QUICK_MIGRATION.md](./QUICK_MIGRATION.md) | البدء السريع | 15 دقيقة |
| [SETUP_TARGET_DATABASE.md](./SETUP_TARGET_DATABASE.md) | إعداد قاعدة البيانات الهدف | 20 دقيقة |

### 📋 التفاصيل والشرح

| الدليل | الوصف | الوقت |
|--------|-------|-------|
| [DATABASE_MIGRATION_README.md](./DATABASE_MIGRATION_README.md) | ملف README رئيسي | 10 دقائق |
| [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) | دليل شامل مع تفاصيل | 30 دقيقة |
| [INTERACTIVE_TOOL_GUIDE.md](./INTERACTIVE_TOOL_GUIDE.md) | شرح الأداة التفاعلية | 15 دقيقة |

### ✅ التحقق والتبديل

| الدليل | الوصف | الوقت |
|--------|-------|-------|
| [VERIFY_MIGRATION.md](./VERIFY_MIGRATION.md) | التحقق من نجاح النقل | 20 دقيقة |
| [SWITCH_DATABASE.md](./SWITCH_DATABASE.md) | تبديل الموقع للاتصال بقاعدة جديدة | 10 دقائق |

### 🖼️ الملفات والصور

| الدليل | الوصف | الوقت |
|--------|-------|-------|
| [MIGRATE_IMAGES.md](./MIGRATE_IMAGES.md) | نقل الصور والملفات | 25 دقيقة |

### ↩️ الرجوع والاستعادة

| الدليل | الوصف | الوقت |
|--------|-------|-------|
| [ROLLBACK_MIGRATION.md](./ROLLBACK_MIGRATION.md) | الرجوع للخلف في حالة المشاكل | 15 دقيقة |

### 📊 الملخصات والفهارس

| الدليل | الوصف | الوقت |
|--------|-------|-------|
| [DATABASE_MIGRATION_SUMMARY.md](./DATABASE_MIGRATION_SUMMARY.md) | ملخص شامل | 10 دقائق |
| [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md) | ملخص الإنجاز | 5 دقائق |
| [MIGRATION_INDEX.md](./MIGRATION_INDEX.md) | فهرس شامل | 10 دقائق |
| [MIGRATION_TOOLS_SUMMARY.txt](./MIGRATION_TOOLS_SUMMARY.txt) | ملخص نصي | 5 دقائق |

---

## 🛠️ الأدوات المتاحة

### سكريبتات النقل

```bash
# الطريقة التفاعلية (الموصى به)
npm run migrate:interactive

# باستخدام ملف البيئة
npm run migrate
```

### ملفات التكوين

- `.env.migration.example` - مثال على ملف المتغيرات

### ملفات السكريبتات

- `scripts/migrate-database.js` - سكريبت النقل الأساسي
- `scripts/interactive-migrate.js` - أداة تفاعلية
- `scripts/migrate-database.ts` - نسخة TypeScript

---

## 🎯 خريطة الطريق

### المرحلة 1: التحضير (30 دقيقة)
```
START_HERE.md
    ↓
GET_CREDENTIALS.md
    ↓
SETUP_TARGET_DATABASE.md
```

### المرحلة 2: النقل (5-15 دقيقة)
```
npm run migrate:interactive
    ↓
INTERACTIVE_TOOL_GUIDE.md (إذا احتجت مساعدة)
```

### المرحلة 3: التحقق (20 دقيقة)
```
VERIFY_MIGRATION.md
    ↓
اختبر الموقع
```

### المرحلة 4: التبديل (10 دقائق)
```
SWITCH_DATABASE.md
    ↓
أعد تشغيل الخادم
```

### المرحلة 5: النشر (15 دقيقة)
```
اختبر محلياً
    ↓
نشّر التحديثات
    ↓
راقب الموقع
```

---

## 🔍 البحث السريع

### أريد...

| الهدف | الدليل |
|------|--------|
| البدء السريع | [START_HERE.md](./START_HERE.md) |
| الحصول على المفاتيح | [GET_CREDENTIALS.md](./GET_CREDENTIALS.md) |
| فهم العملية | [QUICK_MIGRATION.md](./QUICK_MIGRATION.md) |
| إعداد قاعدة جديدة | [SETUP_TARGET_DATABASE.md](./SETUP_TARGET_DATABASE.md) |
| شرح الأداة التفاعلية | [INTERACTIVE_TOOL_GUIDE.md](./INTERACTIVE_TOOL_GUIDE.md) |
| التحقق من النقل | [VERIFY_MIGRATION.md](./VERIFY_MIGRATION.md) |
| تبديل الموقع | [SWITCH_DATABASE.md](./SWITCH_DATABASE.md) |
| نقل الصور | [MIGRATE_IMAGES.md](./MIGRATE_IMAGES.md) |
| الرجوع للخلف | [ROLLBACK_MIGRATION.md](./ROLLBACK_MIGRATION.md) |
| فهرس شامل | [MIGRATION_INDEX.md](./MIGRATION_INDEX.md) |
| ملخص كامل | [DATABASE_MIGRATION_SUMMARY.md](./DATABASE_MIGRATION_SUMMARY.md) |

---

## ❓ الأسئلة الشائعة

### س: من أين أبدأ؟
ج: اقرأ [START_HERE.md](./START_HERE.md)

### س: كيف أحصل على المفاتيح؟
ج: اقرأ [GET_CREDENTIALS.md](./GET_CREDENTIALS.md)

### س: كيف أستخدم الأداة التفاعلية؟
ج: اقرأ [INTERACTIVE_TOOL_GUIDE.md](./INTERACTIVE_TOOL_GUIDE.md)

### س: كيف أتحقق من نجاح النقل؟
ج: اقرأ [VERIFY_MIGRATION.md](./VERIFY_MIGRATION.md)

### س: كيف أبدّل الموقع للاتصال بقاعدة جديدة؟
ج: اقرأ [SWITCH_DATABASE.md](./SWITCH_DATABASE.md)

### س: ماذا لو حدث خطأ؟
ج: اقرأ [ROLLBACK_MIGRATION.md](./ROLLBACK_MIGRATION.md)

---

## 📊 الجداول المنقولة

✅ categories
✅ subcategories
✅ services
✅ product_images
✅ product_sizes
✅ banners
✅ store_settings
✅ testimonials

---

## 🔐 نصائح الأمان

- ✅ استخدم Service Role Keys فقط
- ✅ لا تشارك المفاتيح
- ✅ احذف ملف .env.migration بعد النقل
- ✅ احتفظ بنسخة احتياطية

---

## ⏱️ الوقت الإجمالي

- **التحضير:** 30 دقيقة
- **النقل:** 5-15 دقيقة
- **التحقق:** 20 دقيقة
- **التبديل:** 10 دقائق
- **النشر:** 15 دقيقة

**المجموع:** 1.5-2 ساعة

---

## 📞 الدعم

إذا واجهت مشاكل:

1. ابحث في الفهرس أعلاه
2. اقرأ الدليل المناسب
3. اتبع استكشاف الأخطاء
4. جرّب الرجوع للخلف

---

**ملاحظة:** جميع الأدلة متوفرة بصيغة Markdown ويمكنك قراءتها في أي محرر نصوص.

**آخر تحديث:** مارس 2026
**الإصدار:** 1.0.0
**الحالة:** ✅ جاهز للاستخدام
