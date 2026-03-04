# 🔑 كيفية الحصول على بيانات الاتصال

دليل خطوة بخطوة للحصول على مفاتيح Supabase المطلوبة للنقل.

## 📍 الخطوة 1: اذهب إلى Supabase Dashboard

1. افتح [Supabase Dashboard](https://app.supabase.com)
2. سجّل دخولك بحسابك
3. ستظهر قائمة مشاريعك

## 📍 الخطوة 2: اختر المشروع

1. انقر على المشروع الذي تريد نقل البيانات منه (المصدر)
2. أو انقر على المشروع الذي تريد نقل البيانات إليه (الهدف)

## 📍 الخطوة 3: اذهب إلى إعدادات API

1. في الشريط الجانبي الأيسر، اذهب إلى **Settings**
2. انقر على **API**

## 📍 الخطوة 4: انسخ البيانات المطلوبة

### Project URL
```
يظهر في الأعلى تحت "Project URL"
مثال: https://your-project.supabase.co
```

### Anon public key
```
يظهر تحت "Project API keys"
ابحث عن "anon public"
```

### Service Role Key ⭐ (الأهم)
```
يظهر تحت "Project API keys"
ابحث عن "service_role"
هذا هو المفتاح الذي تحتاجه للنقل
```

## 🔐 ملاحظات أمان مهمة

### استخدم Service Role Key فقط
- ✅ Service Role Key - استخدمه للنقل
- ❌ Anon Key - لا تستخدمه للنقل

### لماذا Service Role Key؟
- لديه صلاحيات كاملة
- يمكنه الوصول إلى جميع البيانات
- مطلوب للعمليات الإدارية

### لا تشارك المفاتيح
- ❌ لا تضعها في Git
- ❌ لا تشاركها مع أحد
- ❌ لا تضعها في رسائل أو بريد إلكتروني

## 📋 قائمة المفاتيح المطلوبة

### لقاعدة البيانات المصدر (القديمة)
- [ ] `SOURCE_SUPABASE_URL` - Project URL
- [ ] `SOURCE_SUPABASE_KEY` - Service Role Key

### لقاعدة البيانات الهدف (الجديدة)
- [ ] `TARGET_SUPABASE_URL` - Project URL
- [ ] `TARGET_SUPABASE_KEY` - Service Role Key

## 🎯 مثال على البيانات

```
SOURCE_SUPABASE_URL=https://old-project.supabase.co
SOURCE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

TARGET_SUPABASE_URL=https://new-project.supabase.co
TARGET_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ✅ التحقق من البيانات

### تحقق من أن البيانات صحيحة

1. **Project URL** يجب أن يبدأ بـ `https://`
2. **Service Role Key** يجب أن يكون طويلاً (أكثر من 100 حرف)
3. **المفاتيح** يجب أن تكون مختلفة لكل مشروع

### اختبر الاتصال

```bash
# استخدم الأداة التفاعلية
npm run migrate:interactive

# ستختبر الاتصال تلقائياً
```

## 🔄 إذا نسيت المفاتيح

### إعادة تعيين المفاتيح

1. اذهب إلى **Settings** → **API**
2. انقر على **Regenerate** بجانب المفتاح
3. ستحصل على مفتاح جديد

⚠️ **تحذير:** إعادة التعيين ستبطل المفتاح القديم!

## 📞 الدعم

إذا لم تتمكن من العثور على المفاتيح:

1. تأكد من أنك مسجل دخول
2. تأكد من أنك في المشروع الصحيح
3. تأكد من أن لديك صلاحيات الوصول
4. جرّب تحديث الصفحة

---

**ملاحظة:** احفظ المفاتيح في مكان آمن، وحذفها بعد انتهاء النقل.
