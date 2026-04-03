# Headspace

A full-stack mindfulness and meditation platform with an iOS app, web app, and REST API — inspired by [headspace.com](https://www.headspace.com).

## Live Links

| Platform | URL |
|----------|-----|
| API | [headspace-api.vercel.app](https://headspace-api.vercel.app/) |
| Website | [headspace-website.vercel.app](https://headspace-website.vercel.app/) |

## Project Structure

```
├── api/          # REST API (Hono + Vercel)
├── mobile/       # iOS app (SwiftUI)
└── website/      # Web app (Next.js + Tailwind CSS)
```

### API

REST API built with Hono, deployed on Vercel. Serves content, user data, collections, and an AI chat companion (Luma).

**Key endpoints:**
- `GET /api/users/:id/today` — Personalized daily feed
- `GET /api/explore` — Categories, featured collections, guided programs
- `GET /api/content/:id` — Content detail
- `GET /api/collections/:id` — Collection with session list
- `GET /api/users/:id/luma` — AI chat history + suggestions
- `POST /api/users/:id/luma/messages` — Send a chat message
- `GET /api/users/:id/profile` — User profile + stats

### Mobile (iOS)

Native SwiftUI app with tab-based navigation: Today, Explore, Luma, and Profile.

### Website

Next.js 16 web app with TypeScript and Tailwind CSS. Mirrors the mobile experience with 7 pages: landing, today feed, explore, content detail, collection detail, Luma AI chat, and user profile. Zero-config Vercel deployment.

```bash
cd website && npm install && npm run dev
```

## Features

- **Meditation & Breathwork** — Guided sessions from 1 to 20 minutes
- **Sleep Stories** — Calming audio content for better rest
- **Guided Programs** — Multi-session courses like CBT for Anxiety & Depression
- **Luma AI Chat** — Mindfulness companion with personalized suggestions
- **Streak Tracking** — Daily activity streaks and mindful minute stats
- **Explore & Discover** — Browse by category, featured collections, and curated content

## Marketing

### Be kind to your mind

Headspace makes meditation and mindfulness simple. Whether you need to manage stress, sleep better, or sharpen your focus — we have hundreds of guided sessions, sleep stories, and breathing exercises to help you build a healthier, happier life.

**Why Headspace?**

- **Personalized for you** — Your daily feed adapts to your habits, preferences, and where you left off
- **Programs that work** — Structured courses grounded in CBT and mindfulness research, with sessions under 10 minutes a day
- **Luma, your AI companion** — A calm, supportive chat assistant that helps you find the right content for how you're feeling right now
- **Track your progress** — Streaks, mindful minutes, and session stats keep you motivated
- **Available everywhere** — Native iOS app and a responsive web experience, powered by the same API

Join millions of people finding more peace, better sleep, and a happier life.

[Get started →](https://headspace-website.vercel.app/today)
