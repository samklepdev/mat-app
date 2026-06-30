# MAT App

A React Native mobile app built with Expo for medication-assisted treatment (MAT) support. The project uses Expo Router, SQLite persistence, and local-only onboarding/check-in experiences for a private, device-first tracking flow.

## Key Features

- Onboarding flow for treatment setup
- Daily check-in experience with mood, sleep, cravings, and medication adherence tracking
- Streak tracking and progress overview
- Journal tab placeholder for future entries
- Settings tab placeholder for medication, notification, and security preferences
- Uses local persistent storage via SQLite
- Expo Router-based navigation with tab layout

## Tech Stack

- Expo SDK `~56.0.12`
- React `19.2.3`
- React Native `0.85.3`
- Expo Router `~56.2.11`
- Expo SQLite `~56.0.5`
- Zustand for state management
- TypeScript `~6.0.3`

## Project Structure

- `app/` — app routes and screen components
  - `app/_layout.tsx` — root navigation layout and startup logic
  - `app/onboarding.tsx` — onboarding flow screens
  - `app/(tabs)/` — tabbed app experience
    - `index.tsx` — home/today screen
    - `journal.tsx` — journal screen
    - `settings.tsx` — settings screen
- `components/` — reusable UI and feature components
  - `components/features/CheckInWidget.tsx`
  - `components/features/StreakCard.tsx`
  - `components/ui/` — base UI primitives like buttons and cards
- `constants/theme.ts` — color, typography, spacing, and styling constants
- `db/index.ts` — database initialization and SQLite helpers
- `store/index.ts` — Zustand state stores
- `types/index.ts` — shared TypeScript models and domain types

## Setup

1. Install dependencies:

   ```bash
   yarn install
   # or npm install
   ```

2. Start the Expo development server:

   ```bash
   yarn start
   # or npm run start
   ```

3. Run on a device or emulator:

   ```bash
   yarn ios
   yarn android
   yarn web
   ```

## Notes

- The app currently initializes the local database and immediately redirects to onboarding on startup.
- The home screen shows a daily check-in widget and current stability streak.
- Journal and Settings tabs are scaffolded and ready for further feature implementation.
- No remote backend is included; data is managed locally.

## Customization

- Change app metadata in `app.json`.
- Modify the onboarding medication options in `app/onboarding.tsx`.
- Extend SQLite helpers in `db/index.ts` for persistence and query logic.
- Update app theme values in `constants/theme.ts`.

## Running in Development

- `yarn start` — launch Expo Metro
- `yarn ios` — build and run on iOS simulator/device
- `yarn android` — build and run on Android emulator/device
- `yarn web` — run in a browser via Expo Web

## License

This repository is private and not intended for public distribution.
