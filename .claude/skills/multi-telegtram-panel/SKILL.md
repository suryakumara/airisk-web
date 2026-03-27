# AIRISK Full-Stack Skill

## (Telegram Multi-Bot Dashboard + Auth)

## Trigger conditions

Use this skill when the user asks to:

- Build a Telegram bot dashboard / multi-bot panel
- Create a multi-chat grid UI for Telegram bots
- Build something like "TweetDeck but for Telegram bots"
- Manage multiple Telegram bots from one page
- View/send messages from multiple bots simultaneously
- Build login / register page for a React + TypeScript app
- Add JWT authentication to a Node.js + Express backend
- Create full-stack auth (frontend + backend together)
- to add or delete telegram bots from a dashboard, should confirm with user if they want to add or delete the bot, and ask for the bot token when adding a new bot. When deleting a bot, ask for confirmation before deletion.
- can edit bot details (name, description) from the dashboard, and save the changes to the backend. When editing bot details, should validate the input and show error messages if the input is invalid.

---

## What this skill produces

A full-stack app with three parts:

1. **Back-end** — Node.js/Express with MySQL auth (register, login, JWT) + Telegram proxy
2. **Front-end** — React + TypeScript + Tailwind with login/register pages + Telegram grid dashboard
3. **State** — Zustand for bot store, persisted to localStorage

---

## CRITICAL: Folder & file structure (ALWAYS follow this exactly)

```
project-root/
├── back-end/
│   ├── node_modules/
│   ├── outputs/
│   ├── template/
│   ├── uploads/
│   ├── src/
│   │   ├── app.js                        ← entry point
│   │   ├── routes/
│   │   │   └── auth.routes.js
│   │   ├── controllers/
│   │   │   └── auth.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js
│   │   ├── models/
│   │   │   └── user.model.js
│   │   └── utils/
│   │       └── jwt.utils.js
│   ├── package.json
│   └── .env.example
│
└── front-end/
    ├── node_modules/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── LoginForm.tsx
    │   │   │   └── RegisterForm.tsx
    │   │   ├── layout/
    │   │   │   └── AuthLayout.tsx
    │   │   └── ui/
    │   │       ├── Input.tsx
    │   │       ├── Button.tsx
    │   │       └── BotPanel.tsx
    │   ├── pages/
    │   │   ├── LoginPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   └── DashboardPage.tsx
    │   ├── hooks/
    │   │   ├── useAuth.ts
    │   │   └── useTelegram.ts
    │   ├── services/
    │   │   ├── api.ts
    │   │   └── auth.service.ts
    │   ├── store/
    │   │   ├── useAuthStore.ts
    │   │   └── useBotStore.ts
    │   ├── types/
    │   │   └── auth.types.ts
    │   ├── utils/
    │   │   └── telegramApi.ts
    │   ├── styles/
    │   │   └── index.css
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── tsconfig.app.json
```

---

## BACK-END AUTH FILES

### back-end/package.json

## Client — src/utils/telegramApi.js

## Client — src/components/BotPanel.jsx

## Client — package.json dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
```

---

## Client — .env.example

```
VITE_PROXY_URL=http://localhost:3001
```

---

## Setup & run instructions

```bash
# 1. Install & run proxy
cd server
npm install
cp .env.example .env
npm run dev

# 2. Install & run React
cd ../client
npm install
cp .env.example .env
npm run dev

# 3. Open browser
# http://localhost:5173
```

---

## Deploy to production

### Proxy → Railway / Render

```bash
# Set env var on Railway/Render dashboard:
CLIENT_URL=https://your-dashboard.vercel.app
PORT=3001
```

### Frontend → Vercel / Netlify

```bash
# Set env var:
VITE_PROXY_URL=https://your-proxy.railway.app
```

---

## Telegram Bot API methods supported

| Action       | API Method     | Route                        |
| ------------ | -------------- | ---------------------------- |
| Kirim teks   | `sendMessage`  | `/tg/bot{token}/sendMessage` |
| Kirim gambar | `sendPhoto`    | `/send-photo` (multipart)    |
| Kirim file   | `sendDocument` | `/send-document` (multipart) |
| Kirim video  | `sendVideo`    | `/send-video` (multipart)    |
| Terima pesan | `getUpdates`   | `/tg/bot{token}/getUpdates`  |
| Info bot     | `getMe`        | `/tg/bot{token}/getMe`       |

---

## Notes for Claude

- Always generate ALL files listed in the file structure above
- The proxy is mandatory — Telegram blocks direct browser requests (CORS)
- Polling interval is 3000ms by default — suggest webhook for production
- Bot token format: `123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ`
- Chat ID can be obtained from `getUpdates` after user sends first message to bot
- State is persisted to localStorage via zustand persist middleware
- Notification.requestPermission() must be called on user gesture in production browsers
