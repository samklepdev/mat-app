# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Expo SDK 56 — read before writing code

This app targets **Expo SDK 56**, which is newer than most training data. Key facts (fetched from https://docs.expo.dev/versions/v56.0.0/ — reconfirm there if something looks off or you need an API not covered below):

- React Native `0.85`, React `19.2.3`, TypeScript `~6.0.3`, Node.js `22.13.x`+ required.
- iOS minimum `16.4+`, Xcode `26.4+`, Android `compileSdkVersion 36`.
- `expo-sqlite`: synchronous API (`openDatabaseSync`, `execSync`, `runSync`, `getFirstSync`, `getAllSync`) — this is what `db/index.ts` uses throughout. Sync calls block the JS thread; keep queries small. Never interpolate raw values into `execSync`/`execAsync` SQL strings — use `?` placeholders via `runSync`/`getAllSync` as the existing code does.
- `expo-notifications`: notification categories/actions via `setNotificationCategoryAsync`; triggers use `Notifications.SchedulableTriggerInputTypes` (`DAILY`, `WEEKLY`, etc.), not the old string trigger shape. Push notifications don't work in Expo Go on Android (dev build required) — irrelevant here since this app is local-only and uses local notifications.
- `expo-task-manager`: `TaskManager.defineTask` **must** be called in global scope (see `tasks/medicationTask.ts`, imported once at the top of `app/_layout.tsx`) — never inside a component or effect.
- `expo-location`: `requestForegroundPermissionsAsync()` then `getCurrentPositionAsync()`; only foreground permission is used (`api/findTreatment.ts` / find-care flow).
- Expo Router file-based routing (see Architecture below) with `experiments.typedRoutes: true` in `app.json`.

If you're about to use an Expo SDK API not covered above, check the versioned docs at `https://docs.expo.dev/versions/v56.0.0/sdk/<package>/` rather than relying on general React Native/older-Expo knowledge — SDK 56 sync/async APIs and trigger shapes commonly differ from older SDKs.

## Commands

```bash
npm install         # install dependencies
npm run start        # expo start — Metro dev server
npm run ios          # expo run:ios
npm run android      # expo run:android
npm run web          # expo start --web
```

There is no configured lint, typecheck, or test script in `package.json`. Use `npx tsc --noEmit` for a manual typecheck against `tsconfig.json` if needed.

## Architecture

**Local-first, no backend.** All user data (profile, medications, check-ins, journal, wins, saved providers) is stored on-device in SQLite. The one exception is `api/findTreatment.ts`, which calls the public SAMHSA `findtreatment.gov` API to search for nearby MAT providers — nothing about the user is sent to it beyond lat/lng.

**Startup flow** (`app/_layout.tsx`): on mount, `initDatabase()` creates tables/runs additive migrations (best-effort `ALTER TABLE`, ignoring "column exists" errors — see `db/index.ts`), then `getProfile()` checks for a completed onboarding row. If found, the Zustand user store is hydrated and the app routes to `(tabs)`; otherwise it routes to `/onboarding`. `tasks/medicationTask.ts` is imported for its side effect (registers the background task) before anything else runs.

**Routing** (Expo Router, file-based):
- `app/_layout.tsx` — root `Stack`, registers all modal/detail screens (`learn-article`, `journal-write`, `right-now`, `why-note`, `medication-detail` are presented as modals).
- `app/(tabs)/_layout.tsx` — the `Tabs` navigator: Today (`index`), Learn, Find Care, Journal, Settings.
- `app/onboarding/` — onboarding flow, routed to when no completed profile exists.
- Screens outside `(tabs)` (`wins`, `medications`, `saved-providers`, `export-summary`, etc.) are pushed from within tab screens.

**State layers** — two distinct, deliberately separate:
1. **SQLite (`db/index.ts`)** is the source of truth for persisted data, organized by domain with `// ─── Section ───` comment dividers (Profile, Check-in, Journal, Stability, Saved Provider, Wins, Insights, Milestone queries). Row-shape mapping from `Record<string, unknown>` to typed domain objects happens at the call site (see `mapRowToProfile` in `app/_layout.tsx`), not inside `db/index.ts`.
2. **Zustand (`store/index.ts`)** holds only in-memory UI/session state hydrated from SQLite reads (`useCheckInStore`, `useMedicationStore`, `useUserStore`). It is not itself persisted — don't treat it as a cache that survives without re-reading the DB.

**Domain types** live in `types/index.ts` and are the shared contract between `db/index.ts` row-mappers, Zustand stores, and screens.

**Date handling**: always use `utils/date.ts` helpers (`todayLocalISO`, `toLocalISO`, `parseLocalISO`) instead of `Date#toISOString()` for calendar-day logic — `toISOString()` converts to UTC first and can shift the date near local midnight. `db/index.ts`'s streak calculation and the medication background task both depend on this.

**Insights** (`utils/insights.ts`) is a pure function (`generateInsights`) over raw check-in rows — no I/O, deliberately conservative (minimum sample sizes before surfacing a trend/correlation, capped at 3 insights returned). Keep new insight logic pure and testable the same way.

**Notifications** (`hooks/useNotifications.ts` + `tasks/medicationTask.ts`): local-only, no push server. `registerNotificationCategory()` sets up the "I took it" quick action; `useNotifications()` is the in-foreground listener hook; the `TaskManager`-defined task in `tasks/medicationTask.ts` handles the same action when the app is backgrounded/killed, and writes directly to SQLite via a dynamic `import('../db')`.

**Theme** (`constants/theme.ts`): dark-only design system — `Colors`, `Typography`, `Spacing`, `Radius`, `Shadow` — all screens/components pull from here rather than hardcoding style values.

**Path alias**: `@/*` maps to the project root (see `tsconfig.json`).
