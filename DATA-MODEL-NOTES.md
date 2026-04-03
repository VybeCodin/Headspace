# Headspace Data Model — Quick Reference

## AI Assistant Name: **Luma**
Warm, light, gentle. Works in UI: "Chat with Luma", "Luma suggests..."

---

## Core Entities

```
┌─────────────┐     ┌────────────┐     ┌──────────────┐
│   content    │────▶│  category   │     │  collection   │
│             │     │            │     │  (programs,   │
│ meditation  │     │ Meditate   │     │   playlists)  │
│ sleep_story │     │ Sleep      │     │              │
│ soundscape  │     │ Move       │     │ contains     │
│ breathwork  │     │ Focus      │     │ content_ids[]│
│ video       │     │ Stress     │     └──────────────┘
│ focus_music │     └────────────┘
└──────┬──────┘
       │ referenced by
       ▼
┌─────────────────┐     ┌──────────────┐
│ user_progress    │────▶│    user       │
│                 │     │             │
│ status          │     │ preferences │
│ progress_seconds│     │ subscription│
│ completed_at    │     │ saved_ids[] │
└─────────────────┘     └──────────────┘
       │ aggregates into
       ▼
┌─────────────────┐
│  user_stats      │
│                 │
│ total_sessions  │
│ total_minutes   │
│ streak_days     │
└─────────────────┘
```

## Key Design Decisions

1. **Single `content` entity** — every meditation, sleep story, video, and soundscape is the same type with a `type` field. Keeps things simple.

2. **Server-driven Today tab** — the `sections` array means the backend controls layout. Add/remove/reorder sections without app updates.

3. **`content_id` is the universal link** — today tab items, collections, user progress, saved items, and Luma recommendations all reference content by ID.

4. **Stats are computed, not stored** (initially) — derive streaks and totals from `user_progress` rows. Cache in `user_stats` when performance matters.

5. **Luma conversations are simple** — just messages with roles. Content recommendations link back via `content_id`. No complex AI state needed on frontend.

## What Each Tab Pulls From

| Tab | Entities Used |
|-----|--------------|
| Today | content, user_progress, collection (for editorial sections) |
| Explore | category, content, collection |
| Sleep & Meditate | content (filtered by type), collection |
| Luma | conversation, messages, content (for recommendations) |
| Profile | user, user_stats, user_progress, content (saved/recent) |

## Future Backend Mapping (not designed yet)

When you build the API, these are the likely endpoints:
- Content CRUD + search/filter
- Categories (mostly static)
- Collections (curated + personalized)
- User progress tracking (start, update, complete)
- User profile + preferences
- Luma chat (send message → get response)
- Today feed (personalized sections)

The JSON structures in `data-model.json` map almost 1:1 to API response shapes.
