# دليل أساسيات بناء تطبيق (Expo + Supabase) — قالب عام قابل لإعادة الاستخدام

> **طريقة الاستخدام:** انسخ هذا الملف وأرسله للذكاء الاصطناعي، ثم أضف بعده وصف تطبيقك (الشاشات والميزات)، مع جملة: *"نفّذ الأساسيات حرفياً، مرحلة بعد مرحلة، وسلّمني كل ملف كاملاً بدون اختصار."*
> الأكواد والأوامر بالإنجليزية، والشرح بالعربية.
> كل ما بين `<>` يُستبدل بقيمة تطبيقك.

---

## 0. قواعد صارمة للذكاء الاصطناعي

1. التطبيق **مستقل تماماً** عن أي تطبيق آخر: ممنوع استخدام أي مفتاح أو رابط أو معرّف من مشروع آخر.
2. مشروع **Supabase جديد**، ومشروع **EAS جديد**، و**هوية تطبيق فريدة** (`slug` و`package` و`bundleIdentifier`).
3. **ممنوع ترقية** أي حزمة خارج الإصدارات المحددة في القسم 2. عند التعارض: `npx expo install <package>` وليس `npm install` للحزم المرتبطة بـ Expo.
4. اكتب **كل ملف كاملاً** من أول سطر لآخر سطر. ممنوع `// ... بقية الكود` أو `TODO` أو أي اختصار.
5. لا تُنشئ ملفات Excel أو PowerPoint أو HTML. المخرجات هي ملفات المشروع فقط (JS/JSX/JSON/SQL/MD).
6. لا تضع **service_role key** داخل التطبيق أبداً. المسموح فقط **anon (publishable) key**.
7. نظام الدخول **مخصص** (اسم مستخدم + كلمة مرور) عبر دوال RPC آمنة، دون الاعتماد على Supabase Auth (القسم 7).
8. كل استدعاء لقاعدة البيانات يمر عبر ملف واحد: `src/lib/api.js`. ممنوع استدعاء `supabase` مباشرة من الشاشات.
9. كل الحسابات والمنطق الحساس (أرصدة، صلاحيات، تحقق) في **قاعدة البيانات**، والتطبيق يعرض فقط.
10. بعد الانتهاء نفّذ **قائمة القبول** (القسم 12) وأعد النتيجة بنعم/لا لكل بند.

---

## 1. المبدأ المعماري (لماذا يعمل هذا القالب)

- التطبيق يستخدم مفتاح anon العام، لذلك **لا يُسمح** له بقراءة الجداول مباشرة.
- **RLS مفعّل على كل الجدول بدون أي policy** ← لا قراءة ولا كتابة مباشرة.
- كل العمليات عبر **دوال Postgres** بصلاحية `SECURITY DEFINER` و`search_path` ثابت، وكل دالة تتحقق من الجلسة (token) ثم من الدور إن لزم.
- الجلسة = `token` (uuid) محفوظ في AsyncStorage وينتهي بعد 30 يوماً.
- طبقة واحدة في التطبيق (`api.js`) تترجم أخطاء الدوال إلى رسائل عربية.

---

## 2. التقنيات والإصدارات (ثبّتها قبل البدء)

| العنصر | الإصدار |
|---|---|
| Expo SDK | `<SDK_VERSION>` |
| React Native | `<الإصدار المطابق للـ SDK>` |
| React | `<الإصدار المطابق للـ SDK>` |
| Expo Router | `<الإصدار المطابق للـ SDK>` |
| إدارة الحالة | Zustand `^4.5` |
| تخزين الجلسة | `@react-native-async-storage/async-storage` (المتوافق مع الـ SDK) |
| قاعدة البيانات | Supabase (`@supabase/supabase-js ^2`) + `react-native-url-polyfill` |
| الخط | Cairo عبر `@expo-google-fonts/cairo` + `expo-font` |
| البناء | EAS Build |
| اللغة | JavaScript (JSX) |

> **مهم:** قبل البدء تحقق من أحدث Expo SDK المستقر ومتطلبات Android API في Google Play، ثم ثبّت الإصدارات المتوافقة معاً. الجدول أعلاه يُملأ مرة واحدة ولا يتغير أثناء المشروع.

---

## 3. المتطلبات المسبقة

```bash
node -v      # Node LTS
npm -v
git --version
```

- حساب في **expo.dev** وحساب في **supabase.com**، ومحرر VS Code.

---

## 4. إنشاء المشروع وتثبيت الحزم

```bash
npx create-expo-app@latest <app-name> --template blank@sdk-<SDK_NUMBER>
cd <app-name>

npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar expo-font @react-native-async-storage/async-storage

npm install zustand @supabase/supabase-js react-native-url-polyfill @expo-google-fonts/cairo

npx expo install --fix
```

**تعديلات إلزامية بعد الإنشاء:**

1. احذف `App.js` و`index.js` من الجذر.
2. في `package.json`: `"main": "expo-router/entry"`
3. أنشئ `babel.config.js`:
   ```js
   module.exports = function (api) {
     api.cache(true);
     return { presets: ['babel-preset-expo'] };
   };
   ```

---

## 5. هيكل الملفات الأساسي

```
<app-name>/
├─ app/
│  ├─ _layout.jsx          # الجذر + AuthGuard + الخطوط + RTL
│  ├─ index.jsx            # الشاشة الرئيسية
│  ├─ login.jsx
│  └─ register.jsx
├─ src/
│  ├─ constants/config.js  # COLORS + SUPABASE_URL + SUPABASE_ANON_KEY
│  ├─ lib/supabase.js      # إنشاء العميل فقط
│  ├─ lib/api.js           # المحوّل الوحيد لكل استدعاءات Supabase
│  ├─ store/authStore.js   # Zustand: المستخدم والجلسة
│  └─ components/          # Button, Input, Screen ... إلخ
├─ assets/ (icon.png, adaptive-icon.png, splash.png)
├─ supabase/schema.sql
├─ app.json
├─ eas.json
├─ babel.config.js
└─ package.json
```

> شاشات وميزات تطبيقك تُضاف داخل `app/` و`src/components/` بنفس النمط.

---

## 6. ملفات الإعدادات

### 6.1 `app.json`

> `slug` و`package` و`bundleIdentifier` يجب أن تكون **فريدة ومختلفة** عن كل تطبيقاتك الأخرى.

```json
{
  "expo": {
    "name": "<اسم التطبيق>",
    "slug": "<unique-slug>",
    "scheme": "<unique-scheme>",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "<لون الخلفية>"
    },
    "assetBundlePatterns": ["**/*"],
    "plugins": ["expo-router"],
    "android": {
      "package": "com.<yourname>.<appname>",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "<لون الخلفية>"
      }
    },
    "ios": {
      "bundleIdentifier": "com.<yourname>.<appname>",
      "supportsTablet": false
    },
    "extra": {
      "eas": { "projectId": "<يُملأ تلقائياً بعد eas init>" }
    }
  }
}
```

قواعد:
- لا تنسخ `projectId` من تطبيق آخر أبداً؛ `eas init` ينشئ واحداً جديداً.
- لا تضف `owner` إلا إذا كنت تبني تحت منظمة.
- plugin `expo-router` إلزامي وإلا لن يعمل التوجيه.

### 6.2 `eas.json`

```json
{
  "cli": { "version": ">= 10.0.0", "appVersionSource": "remote" },
  "build": {
    "preview": { "distribution": "internal", "android": { "buildType": "apk" } },
    "production": { "autoIncrement": true, "android": { "buildType": "app-bundle" } }
  },
  "submit": { "production": {} }
}
```

- **preview** = APK للتثبيت المباشر على الهاتف.
- **production** = AAB للمتاجر.

---

## 7. قاعدة البيانات: مشروع Supabase جديد

### 7.1 الإنشاء

1. supabase.com ← **New project** ← اسم المشروع ← منطقة قريبة ← كلمة مرور قوية (احفظها).
2. من **Project Settings → API** انسخ `Project URL` و`anon public key` فقط.
3. من **SQL Editor** شغّل ملف `schema.sql` كاملاً (واحفظه في `supabase/schema.sql`).

### 7.2 الجداول الأساسية (المستخدمون والجلسات)

```sql
create extension if not exists pgcrypto with schema extensions;

create table public.app_users (
  id            uuid primary key default gen_random_uuid(),
  username      text not null unique check (char_length(username) between 3 and 24),
  password_hash text not null,
  display_name  text not null check (char_length(display_name) between 2 and 32),
  role          text not null default 'user' check (role in ('user','admin')),
  created_at    timestamptz not null default now()
);

create table public.app_sessions (
  token      uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days'
);

-- RLS مفعّل بدون policies = لا وصول مباشر بالمفتاح العام
alter table public.app_users    enable row level security;
alter table public.app_sessions enable row level security;
```

> أضف جداول تطبيقك بنفس القاعدة: فعّل RLS على كل جدول **بدون policies**، وأنشئ الفهارس اللازمة، واستخدم `check` للقيود.

### 7.3 الدوال الأساسية (RPC)

```sql
-- التحقق من الجلسة (داخلية)
create or replace function public._uid(p_token uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v uuid;
begin
  select user_id into v from app_sessions where token = p_token and expires_at > now();
  if v is null then raise exception 'SESSION_INVALID'; end if;
  return v;
end $$;

-- التحقق من صلاحية الإدارة (داخلية)
create or replace function public._require_admin(p_token uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v uuid; r text;
begin
  v := public._uid(p_token);
  select role into r from app_users where id = v;
  if r <> 'admin' then raise exception 'FORBIDDEN'; end if;
  return v;
end $$;

-- بيانات المستخدم الآمنة للإرجاع (داخلية) — لا تُرجع password_hash أبداً
create or replace function public._me(p_id uuid)
returns json language sql security definer set search_path = public as $$
  select json_build_object('id', id, 'username', username,
                           'display_name', display_name, 'role', role)
  from app_users where id = p_id;
$$;

create or replace function public.register(p_username text, p_password text, p_display_name text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid; v_token uuid;
begin
  if char_length(p_password) < 6 then raise exception 'PASSWORD_TOO_SHORT'; end if;
  if exists (select 1 from app_users where lower(username) = lower(p_username)) then
    raise exception 'USERNAME_TAKEN';
  end if;
  insert into app_users (username, password_hash, display_name)
  values (lower(p_username), crypt(p_password, gen_salt('bf')), p_display_name)
  returning id into v_id;
  insert into app_sessions (user_id) values (v_id) returning token into v_token;
  return json_build_object('token', v_token, 'user', public._me(v_id));
end $$;

create or replace function public.login(p_username text, p_password text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid; v_token uuid;
begin
  select id into v_id from app_users
   where lower(username) = lower(p_username)
     and password_hash = crypt(p_password, password_hash);
  if v_id is null then raise exception 'BAD_CREDENTIALS'; end if;
  insert into app_sessions (user_id) values (v_id) returning token into v_token;
  return json_build_object('token', v_token, 'user', public._me(v_id));
end $$;

create or replace function public.get_me(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
begin
  return public._me(public._uid(p_token));
end $$;

create or replace function public.logout(p_token uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from app_sessions where token = p_token;
end $$;

-- منح التنفيذ للمفتاح العام (باستثناء الدوال الداخلية)
revoke all on function public._uid(uuid), public._require_admin(uuid), public._me(uuid)
  from public, anon, authenticated;

grant execute on function
  public.register(text,text,text), public.login(text,text),
  public.get_me(uuid), public.logout(uuid)
to anon;
```

**قالب أي دالة جديدة لتطبيقك:**
1. `SECURITY DEFINER` + `set search_path = public` (وأضف `extensions` إن استخدمت `crypt`).
2. أول سطر: `v := public._uid(p_token)` أو `public._require_admin(p_token)`.
3. كل التحقق والحسابات داخل الدالة.
4. أضفها لقائمة `grant execute ... to anon` (وليس الدوال الداخلية).
5. أسماء الأخطاء رموز ثابتة (`raise exception 'CODE'`) وتُترجم في `api.js`.

**أول مدير:** سجّل حساباً من التطبيق ثم شغّل مرة واحدة في SQL Editor:
```sql
update public.app_users set role = 'admin' where username = '<your_username>';
```

---

## 8. كود الأساس في التطبيق

### 8.1 `src/constants/config.js`

```js
export const SUPABASE_URL = 'https://<PROJECT_REF>.supabase.co';
export const SUPABASE_ANON_KEY = '<ANON_PUBLIC_KEY>';

export const COLORS = {
  bg: '#0B0B14',
  surface: '#14141F',
  surfaceAlt: '#1C1C2B',
  border: '#2A2A3D',
  primary: '#8B5CF6',
  accent: '#22D3EE',
  text: '#F4F4FB',
  textDim: '#9A9AB5',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
};
```

> كل الألوان من هذا الملف فقط، ويمكن تغيير الهوية البصرية كلها من هنا دون لمس بقية الكود.

### 8.2 `src/lib/supabase.js`

```js
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants/config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
```

### 8.3 `src/lib/api.js` (المحوّل الوحيد)

```js
import { supabase } from './supabase';

const ERRORS = {
  SESSION_INVALID: 'انتهت الجلسة، سجّل الدخول من جديد',
  FORBIDDEN: 'ليست لديك صلاحية',
  USERNAME_TAKEN: 'اسم المستخدم مستخدم مسبقاً',
  PASSWORD_TOO_SHORT: 'كلمة المرور قصيرة (6 أحرف على الأقل)',
  BAD_CREDENTIALS: 'اسم المستخدم أو كلمة المرور غير صحيحة',
  // أضف رموز أخطاء تطبيقك هنا
};

async function call(fn, args = {}) {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) {
    const key = Object.keys(ERRORS).find((k) => error.message?.includes(k));
    const err = new Error(key ? ERRORS[key] : 'حدث خطأ غير متوقع، حاول مرة أخرى');
    err.code = key || 'UNKNOWN';
    throw err;
  }
  return data;
}

export const api = {
  register: (username, password, displayName) =>
    call('register', { p_username: username, p_password: password, p_display_name: displayName }),
  login: (username, password) => call('login', { p_username: username, p_password: password }),
  getMe: (t) => call('get_me', { p_token: t }),
  logout: (t) => call('logout', { p_token: t }),
  // + دوال تطبيقك بنفس النمط
};
```

### 8.4 `src/store/authStore.js`

```js
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';

const KEY = '<appname>_session_v1';

export const useAuth = create((set, get) => ({
  token: null,
  user: null,
  ready: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const { token } = JSON.parse(raw);
        const user = await api.getMe(token);
        set({ token, user, ready: true });
        return;
      }
    } catch (e) {
      await AsyncStorage.removeItem(KEY);
    }
    set({ token: null, user: null, ready: true });
  },

  signIn: async (username, password) => {
    const { token, user } = await api.login(username, password);
    await AsyncStorage.setItem(KEY, JSON.stringify({ token }));
    set({ token, user });
  },

  signUp: async (username, password, displayName) => {
    const { token, user } = await api.register(username, password, displayName);
    await AsyncStorage.setItem(KEY, JSON.stringify({ token }));
    set({ token, user });
  },

  refreshUser: async () => {
    const t = get().token;
    if (t) set({ user: await api.getMe(t) });
  },

  signOut: async () => {
    const t = get().token;
    try { if (t) await api.logout(t); } catch (e) {}
    await AsyncStorage.removeItem(KEY);
    set({ token: null, user: null });
  },
}));
```

### 8.5 `app/_layout.jsx` (الجذر + AuthGuard + RTL + الخط)

المتطلبات:
- `I18nManager.allowRTL(true); I18nManager.forceRTL(true);` في أعلى الملف (خارج المكوّن).
- تحميل Cairo (`Cairo_400Regular` و`Cairo_700Bold`) بـ `useFonts`، وعدم عرض أي شيء حتى يجهز الخط وتنتهي `hydrate()`.
- `AuthGuard`: بلا `token` وفي غير `login`/`register` ← `router.replace('/login')`. ومع `token` وفي `login`/`register` ← `router.replace('/')`.
- مسارات الإدارة `/admin/*` لا يدخلها إلا `role = 'admin'`.
- `StatusBar` بنمط `light`، وخلفية `COLORS.bg`، و`Stack` بـ `headerShown: false`.

---

## 9. إرشادات التصميم العامة

- كل الألوان من `COLORS` فقط، ممنوع كتابة ألوان داخل الشاشات.
- بطاقات بحواف مدوّرة (16–20) وحدود رفيعة بلون `border`.
- نص عربي بخط Cairo، حجم أساسي 15–16، والعناوين Bold.
- padding أساسي 16، وأزرار بارتفاع 48 على الأقل.
- حالات تحميل وحالات فراغ برسائل عربية واضحة.
- مؤشر تحميل على الأزرار ومنع الضغط المزدوج.

---

## 10. بناء التطبيق وتثبيته (3 خطوات)

```bash
# 1) تثبيت الأداة
npm install -g eas-cli

# 2) تسجيل الدخول بحساب Expo
eas login

# 3) ربط المشروع (مرة واحدة) ثم البناء
eas init
eas build -p android --profile preview
```

- `eas init` ينشئ مشروعاً جديداً ويكتب `projectId` في `app.json`.
- عند سؤال keystore اختر **Generate new keystore**.
- بعد انتهاء البناء يظهر رابط تحميل الـ APK.
- للتجربة قبل البناء: `npx expo start`.

---

## 11. حل المشاكل الشائعة

| المشكلة | الحل |
|---|---|
| فشل البناء بتعارض إصدارات | `npx expo install --fix` ثم أعد البناء |
| `Unable to resolve module` | `npx expo install <package>` |
| شاشة بيضاء عند الفتح | تأكد من `"main": "expo-router/entry"` وحذف `App.js` ووجود plugin `expo-router` |
| `projectId` غير مطابق | احذف `extra.eas.projectId` وشغّل `eas init` من جديد |
| `package name already exists` | غيّر `android.package` لقيمة فريدة |
| `SESSION_INVALID` بعد فترة | الجلسة 30 يوماً، سجّل الدخول من جديد |
| `function not found` | شغّل `schema.sql` كاملاً وتأكد من أقسام `grant execute` |
| RTL لا يظهر | أغلق التطبيق وافتحه من جديد |
| `crypt` غير موجودة | تأكد من `create extension pgcrypto with schema extensions` وأن `search_path` يتضمن `extensions` |

---

## 12. قائمة القبول (يجيب عنها الذكاء الاصطناعي بنعم/لا)

1. هل المشروع يعمل بالإصدارات المثبتة دون تحذيرات؟
2. هل `slug` و`package` و`bundleIdentifier` فريدة وبلا `projectId` قديم؟
3. هل `eas.json` مطابق للمرجع (preview = apk)؟
4. هل مشروع Supabase جديد ومنفصل، والمفتاح المستخدم anon فقط؟
5. هل RLS مفعّل على كل الجداول بلا policies، وكل الوصول عبر RPC؟
6. هل كل استدعاءات Supabase في `api.js` فقط؟
7. هل الدخول المخصص يعمل مع حفظ الجلسة في AsyncStorage؟
8. هل كل دالة جديدة تتحقق من `_uid` أو `_require_admin` وتحمل `SECURITY DEFINER` و`search_path` ثابت؟
9. هل الواجهة RTL بالكامل بخط Cairo؟
10. هل الأوامر الثلاثة (`npm i -g eas-cli` ← `eas login` ← `eas build`) تبني APK بنجاح؟

---

## 13. تسليم العمل (ما يجب أن يعيده الذكاء الاصطناعي)

1. أوامر الإنشاء والتثبيت (القسم 4).
2. `package.json` و`babel.config.js` و`app.json` و`eas.json` كاملة.
3. `supabase/schema.sql` كامل (الجداول + كل الدوال).
4. ملفات `src/` كاملة.
5. ملفات `app/` كاملة، شاشة بعد شاشة.
6. ما الذي يجب أن أضعه أنا يدوياً (رابط Supabase والمفتاح، أيقونات `assets/`، قيم `<yourname>`).
7. نتيجة قائمة القبول (القسم 12).

**ابدأ الآن من القسم 4.**
