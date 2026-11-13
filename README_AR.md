# ذِكرى — تطبيق React Native أصلي

هذه النسخة إعادة بناء Native وليست WebView. الواجهات مكتوبة بمكونات React Native، والتنقل عبر Expo Router، والاتصال بالخلفية عبر Supabase JS.

## ما تم بناؤه
- تسجيل الدخول وإنشاء الحساب عبر Edge Function الحالية `zikra-username-auth`.
- جلسة Supabase محفوظة محلياً عبر AsyncStorage.
- الرئيسية ومعرض الذكريات، وجلب الصور بروابط موقعة.
- إنشاء الغرف والانضمام برمز عبر `zikra-room-api`.
- عرض تفاصيل الغرفة والأعضاء وطلبات الانضمام (قبول/رفض) وإزالة الأعضاء.
- إنشاء الذكرى واختيار حتى 10 صور من معرض الهاتف ورفعها عبر Cloudinary signed-upload ثم تسجيلها.
- تفاصيل الذكرى، الإعجاب، التعليقات والتعليقات المجهولة، تثبيت الذكرى وحذفها.
- مركز الإشعارات وتحديدها كمقروءة.
- الملف الشخصي وتعديل الاسم والأفتار وتسجيل الخروج.
- مجلد `assets/logos` فارغ لإضافة الشعارات لاحقاً.

## التشغيل
1. ثبّت Node.js LTS.
2. فك الضغط ثم افتح مجلد المشروع في Terminal.
3. نفّذ:
   ```bash
   npm install
   npx expo install --fix
   npx expo start
   ```
4. افتح المشروع عبر Expo Go أو محاكي Android.

## بناء APK
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

## الخلفية المطلوبة
المشروع يحتفظ بعنوان Supabase والمفتاح Publishable الموجودين في HTML الأصلي. يعتمد على وجود الجداول والسياسات والوظائف التالية في مشروع Supabase:
- Edge Functions: `zikra-username-auth`, `zikra-room-api`, `zikra-cloudinary-sign-upload`, `zikra-cloudinary-register-media`, `zikra-cloudinary-deliver-media`.
- الجداول/العروض: `profiles`, `avatars`, `room_members`, `notifications`, `room_join_requests`, `rooms`, `memories`, `memory_media`, `memory_comments`, `memory_comments_visible`, `memory_reactions`, `legal_documents`, `user_legal_acceptances`.
- إعدادات RLS وسياسات التخزين/Cloudinary يجب أن تكون مفعلة كما في الخادم الأصلي.

## ملاحظات مهمة قبل الإنتاج
- لم يتم الاتصال بخادم Supabase أو اختبار الحسابات الفعلية من بيئة البناء هذه.
- يجب التحقق من توافق أعمدة الجداول وسياسات RLS ووظائف Edge Functions مع نسخة الخادم الفعلية.
- إشعارات Realtime، وثائق الشروط الكاملة، وبعض تفاصيل تجربة عارض الصور/إدارة العضوية تحتاج جولة QA وتوسعة قبل النشر العام.
- المفتاح الموجود هو Publishable key، وليس Service Role. لا تضع مفاتيح Service Role أو أسرار Cloudinary داخل التطبيق.
- هذه إعادة بناء Native فعلية للوظائف الأساسية وليست تحويل HTML داخل WebView.

## الملفات
- `ORIGINAL_WEB_REFERENCE.html`: نسخة مرجعية من ملف HTML الأصلي للمراجعة فقط، لا يتم تشغيلها داخل التطبيق.
- `APP_FOUNDATION_GUIDE.md`: دليل الأساس المرفق من المستخدم.
- `assets/logos/`: فارغ لإضافة ملفات الشعار لاحقاً.
