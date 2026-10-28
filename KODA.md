# KODA.md — Контекст проекта Latinus (Medic)

## 📋 Обзор проекта

**Latinus** (внутреннее название) / **Medic** (публичное имя) — PWA-приложение для студентов-медиков. Позволяет изучать латинскую медицинскую терминологию, готовиться к экзаменам по анатомии, отслеживать расписание пар, управлять друзьями и проходить тренировки в формате дуэли.

Приложение работает как одностраничное (SPA) с state-based навигацией, использует Supabase для аутентификации, базы данных и хранения данных, а также полностью офлайн-готово через Service Worker (VitePWA).

## 🛠 Технологии и стек

| Категория | Технология |
|---|---|
| **Фреймворк** | React 19 (JSX automatic runtime) |
| **Сборщик** | Vite 8 |
| **Бэкенд** | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **PWA** | vite-plugin-pwa 2.0 (generateSW) |
| **Деплой** | GitHub Pages (`gh-pages -d dist`) |
| **Линтинг** | ESLint 10 + eslint-plugin-react-hooks |
| **Менеджер пакетов** | pnpm |
| **Язык** | JSX, ES Modules |

## 📁 Структура проекта

```
latinus/
├── src/
│   ├── app/                    # Точка входа
│   │   ├── main.jsx            # React.createRoot, обёртки-провайдеры
│   │   ├── App.jsx             # Роутер через useState + switch/case (~16 экранов)
│   │   └── index.css           # ~5000 строк CSS (переменные тем, все стили)
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.jsx     # Навигация: бургер (мобильный) + sidebar (ПК)
│   │   └── ui/                 # Переиспользуемые UI-компоненты
│   │       ├── CourseFilter.jsx
│   │       ├── DataWarning.jsx # Предупреждение о источнике данных (S3/cache/local)
│   │       ├── InstallPWAButton.jsx
│   │       ├── SubjectCard.jsx
│   │       └── ThemeToggle.jsx
│   ├── context/                # Глобальное состояние
│   │   ├── AuthContext.jsx     # Supabase Auth: login, signup, profile, uploadImage
│   │   ├── ThemeContext.jsx    # Тёмная/светлая тема (localStorage + system)
│   │   ├── FilterContext.jsx   # Курс/семестр (localStorage)
│   │   └── PresenceContext.jsx # Онлайн-статус пользователей (Supabase presence)
│   ├── features/               # Доменные модули
│   │   ├── auth/               # Форма входа, приветствие для гостей
│   │   ├── dictionary/         # Словарь латинских слов с поиском
│   │   ├── exam/               # Билеты анатомии, тест-квиз
│   │   ├── friends/            # Друзья: поиск, заявки, accepted/incoming/outgoing
│   │   ├── games/              # Дуэль вдвоём: лобби, настройка, игра в реальном времени
│   │   ├── home/               # Главная: приветствие, календарь, расписание
│   │   ├── materials/          # Каталог предметов и материалов
│   │   ├── profile/            # Профиль: просмотр, редактирование, аватар
│   │   ├── subjects/           # Действия с предметом (словарь, тренировка)
│   │   └── training/           # Карточки для запоминания (flashcards)
│   ├── hooks/                  # Кастомные хуки
│   │   ├── useFriendshipsRealtime.js
│   │   ├── useIncomingRequestsCount.js
│   │   ├── usePresence.js
│   │   ├── usePWAInstall.js
│   │   └── useSwipe.js         # Свайпы для мобильного меню
│   ├── lib/                    # Утилиты и бизнес-логика
│   │   ├── supabase.js         # Инстанс клиента Supabase (env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
│   │   ├── materials.js        # Загрузка данных: S3 → localStorage-кеш → локальный fallback
│   │   ├── schedule.js         # Расписание: недели, пары, расчёт следующей пары
│   │   ├── friends.js          # CRUD friendship-связей
│   │   ├── games.js            # CRUD игр, очередь слов, рандом дистракторов
│   │   ├── profileUtils.js     # Утилиты профиля (initials, formatMemberSince, calcExpPercent)
│   │   ├── rooms.js            # Заглушка для room codes
│   │   └── shuffle.js          # Fisher-Yates shuffle (рефакторинг Math.random)
│   └── data/                   # Статические JSON-данные
│       ├── manifest.json       # Манифест курсов/семестров/предметов/действий
│       ├── rooms.json          # Коды аудиторий
│       └── courses/
│           └── course-1/
│               └── semester-1/
│                   ├── latin/lexicon.json       # Латинский словарь (37 КБ, 4 группы)
│                   ├── anatomy/
│                   │   ├── tickets.json          # Билеты анатомии (231 КБ)
│                   │   ├── tickets_v1.json       # Старая версия (229 КБ)
│                   │   ├── tickets_v3.json       # Новая версия (242 КБ)
│                   │   └── quiz.json             # Тест по анатомии (4 КБ)
│                   └── schedule/schedule.json    # Расписание (8.8 КБ)
├── public/                     # Статика PWA: иконки, favicon, logo
├── index.html                  # HTML-шаблон, meta PWA
├── vite.config.js              # Vite + PWA (precache, runtimeCaching для Supabase)
├── eslint.config.js            # ESLint flat config (react-hooks + react-refresh)
├── package.json                # Зависимости: react, react-dom, supabase-js, gh-pages
├── pnpm-lock.yaml
└── .gitignore
```

## 🚀 Сборка и запуск

```bash
# Установка зависимостей
pnpm install

# Режим разработки (HMR)
pnpm dev              # http://localhost:5173

# Сборка продакшен
pnpm build            # dist/

# Предпросмотр билда
pnpm preview          # http://localhost:4173

# Линтинг
pnpm lint

# Деплой на GitHub Pages
pnpm deploy           # gh-pages -d dist

# Генерация PWA-иконок
pnpm generate-pwa-assets
```

**Переменные окружения** (`.env.local`):
| Переменная | Назначение |
|---|---|
| `VITE_SUPABASE_URL` | URL Supabase-проекта |
| `VITE_SUPABASE_ANON_KEY` | Анонимный ключ Supabase |
| `VITE_SUPABASE_MATERIALS_BUCKET` | Имя storage-bucket для материалов (по умолчанию `materials`) |

## 🗄 База данных (Supabase)

### Таблицы

**`profiles`** — данные пользователя:
```
id (uuid, PK)
username (text)
display_name (text)
avatar_url (text)
cover_url (text)
bio (text)
progress (jsonb)       # { streak, wordsLearned, subjects: { latin: { wordsLearned: [], attempts } }, history: [{ date, words }] }
group (text)           # "A" | "B" — группа для расписания
created_at (timestamptz)
```

**`friendships`** — связи между пользователями:
```
id (uuid, PK)
user_id (uuid)
friend_id (uuid)
status (text)          # "pending" | "accepted"
created_at (timestamptz)
```

**`games`** — игры вдвоём:
```
id (uuid, PK)
host_id (uuid)
guest_id (uuid)
status (text)          # "invited" | "active" | "finished" | "cancelled"
settings (jsonb)       # { groups, rounds, timePerRound, subject }
state (jsonb)          # { wordQueue, currentIndex, answers: { host: {...}, guest: {...} } }
score_host (int)
score_guest (int)
finished_at (timestamptz)
```

### Storage

| Bucket | Назначение |
|---|---|
| `materials` | JSON-файлы данных (lexicon, tickets, schedule, quiz) |
| `avatars` | Аватары пользователей (автоматически по `user_id/filename`) |

## 📦 Данные и кэширование

### Manifest (`data/manifest.json`)

Иерархия: **Курс → Семестр → Предмет → Действия**. Каждый предмет имеет `type: "subject"` (латинский) или `type: "exam"` (анатомия) и массив `actions` с указателями на `dataFile`.

### Загрузка данных: `loadMaterialData()`

Приоритет загрузки:
1. **S3 (Supabase Storage)** — `fetch(url)` с `cache: "no-cache"`
2. **localStorage-кеш** — 1 день свежий, 7 дней максимум
3. **Локальный fallback** — JSON-файлы прекачены в бандл, загружаются по URL через `fetch` + Service Worker

### Расчёт недели: `getWeekType()`

Учебный год начинается 1 сентября. Чередование: **Числитель → Знаменатель → Числитель...** Вычисляется по номеру недели с начала сентября.

## 🎯 Архитектура

### Навигация

Нет роутера. `App.jsx` хранит `currentScreen` в `useState` и рендерит через `switch/case`:
```
home → materials → subjectActions → wordList | trainingSetup → trainingCards
                 → examSubjectActions → anatomyTickets | examQuiz
home → games (только авторизованным)
home → friends (только авторизованным)
home → profile (всегда)
```

### Realtime

- **Игры** — подписка на `postgres_changes` в таблице `games` по `id`
- **Друзья** — подписка на `friendships` по `user_id` и `friend_id`
- **Онлайн-статус** — Supabase Presence-канал `online-users`
- **Счётчик заявок** — `count: exact` + realtime-подписка на `friendships`

### State management

| Контекст | Данные |
|---|---|
| `AuthProvider` | `user`, `profile`, `loading` + CRUD операции |
| `ThemeProvider` | `theme` (light/dark) |
| `FilterProvider` | `courseId`, `semesterId` |
| `PresenceProvider` | `onlineUsers` (Set<string>) |

## 🎮 Геймификация

### Дуэль вдвоём (`games/`)

1. **GameSetup** — хост выбирает группу друга, группы слов, количество раундов и время
2. **GameLobby** — ожидание принятия приглашения, история игр
3. **GameRoom** — раунды: показан перевод → оба отвечают → показ результата → автопереход
4. **Рандомизация** — `shuffleArray()` (Fisher-Yates) для очереди слов и дистракторов
5. **Результат** — победа тому, кто ответил первым; если оба правильно — по таймстампу
6. **Отключение** — если соперник офлайн > 15 сек, игра завершается

### Прогресс (`profile`)

- `progress.streak` — дней подряд
- `progress.wordsLearned` — уникальные слова (Set)
- `progress.history` — последние 90 записей { date, words }
- `progress.subjects.latin.attempts` — количество тренировочных сессий
- `calcExpPercent()` — XP от 1000 слов (целевой показатель)

## 📐 Стиль кодирования

- **JSX** — automatic runtime, `import React` НЕ используется
- **ES Modules** — `"type": "module"` в package.json
- **Стрелочные функции** — везде
- **Деструктуризация** — стандартный паттерн для props и state
- **Комментарии** — разделители `// ===...===`, эмодзи в комментариях
- **Кэширование данных** — `useMemo` для тяжёлых вычислений, `useCallback` для колбэков
- **Нет TypeScript** — всё на JS

## ⚠️ Известные проблемы

### Критические
- **Расписание** — `Home.jsx` загружает `schedule_v2.json`, но в `src/data/` лежит `schedule.json`. Оффлайн-режим расписания не работает.
- **Бренд-несогласованность** — название в `manifest.json` и `index.html`: «Medic», в Sidebar: «Medicat», в package.json: «latinus».

### ESLint (23 ошибки, 4 предупреждения)
| Правило | Кол-во | Описание |
|---|---|---|
| `set-state-in-effect` | 18 | `setLoading(true)` в `useEffect` при загрузке данных |
| `only-export-components` | 4 | Контексты экспортируют и провайдеры, и хуки |
| `exhaustive-deps` | 1 | `usePresence` — пропущенные deps |
| `purity` | 1 | `Date.now()` в `handleAnswer` (event handler, ложное срабатывание) |

### Данные
- `schedule_v2.json` отсутствует в репозитории
- `tickets_v1.json` и `tickets_v3.json` — старые версии, можно удалить

## 🔗 Внешние ссылки

- **Репозиторий**: `https://github.com/Lesyalys/LinguaLatina`
- **Ветка**: `agents`
- **Деплой**: GitHub Pages (`/LinguaLatina/`)
- **Supabase**: проект `tddgknmpvcitsixstmkx` (из `vite.config.js` runtimeCaching)

## 📝 Примечания для разработчика

1. **Не запускать `Math.random` внутри `useMemo` / рендера** — использовать `shuffleArray()` в event handler или при старте.
2. **Не использовать `alert()`** — вместо этого inline-уведомления через state + CSS-класс `game-notice`.
3. **При загрузке данных через `loadMaterialData`** — всегда обёртывать в `useEffect` с `cancelled`-флагом.
4. **CSS-файл огромный** (~5000 строк) — при добавлении новых экранов искать похожие стили по классам.
5. **PWA-рендер** — `vite.config.js` использует `VitePWA` с `generateSW`. JSON-ассеты прекачатся, Supabase Storage кэшируется через `runtimeCaching`.
6. **Все данные в `src/data/`** — это JSON, а не Supabase. Они используются как начальный контент (лексикон, билеты, расписание).
