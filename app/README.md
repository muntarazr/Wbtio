# app — تطبيق الويب التفاعلي (Next.js 15 & React 19)

> **الغرض:** تطبيق الويب الكامل لموقع ومنصة wbtio، مبني بأحدث معايير Next.js App Router و React 19 و Tailwind CSS.

---

## البنية المعمارية

```
app/
├── page.tsx               # الصفحة الرئيسية (Landing Page)
├── layout.tsx             # التخطيط العام وتضمين الخطوط والبيانات الوصفية
├── globals.css            # أنماط Tailwind والمتغيرات اللونية
├── components/            # مكونات الواجهة (Hero, ServicesOverview, Consultation, إلخ)
├── store/                 # مسار متجر الخدمات
├── pick/                  # أداة حاسبة واختيار الباقات والخدمات
├── api/                   # مسارات الخادم ونقاط النهاية (API Endpoints)
├── fonts/                 # الخطوط المحلية المستخدمة
└── lib/                   # أدوات ودوال مساعدة ومعالجة البيانات
```

---

## أوامر التشغيل والبناء

تُدار الحزم من جذر المستودع (`package.json`):

```bash
# تشغيل خادم التطوير المحلي (http://localhost:3000)
npm run dev

# بناء النسخة الإنتاجية
npm run build

# تشغيل النسخة الإنتاجية بعد البناء
npm run start

# فحص الأخطاء والتنسيق
npm run lint
```

---

## التقنيات المستخدمة

- **الإطار البرمجي:** Next.js 15.0+ (App Router)
- **مكتبة الواجهة:** React 19
- **التصميم:** Tailwind CSS + PostCSS
- **الأيقونات:** Lucide React
- **اللغة:** TypeScript
