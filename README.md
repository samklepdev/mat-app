# Steady

A React Native app for people on medication-assisted treatment (MAT) for opioid use disorder. Daily check-ins, plain-language medication guides, treatment-provider search, a private journal, and support for the moments a craving hits.

Everything the app stores stays on the device. There is no account, no sync, and no analytics.

**Status:** in active development. Not yet submitted to the App Store — see [`docs/app-store-listing.md`](docs/app-store-listing.md) for the listing copy and what is still outstanding.

## What it does

**Today** — a daily check-in covering mood, sleep, comfort, and whether medication was taken, in about twenty seconds. Shows the current stability streak and surfaces something true about what the body is doing as it heals, drawn from a healing timeline keyed to days of consistent treatment.

> Note for anyone reading the code: comfort is stored as `cravings` on the `CheckIn` type, scored 1–5 with 5 meaning *no* cravings. The scale is inverted on purpose so every metric reads "higher is better", and the UI labels it Comfort.

**Learn** — plain-language guides to buprenorphine, methadone, naltrexone, and naloxone, plus articles grouped into *Start here*, *Medication & treatment*, and *Lived experience*.

**Find Care** — searches the public SAMHSA [findtreatment.gov](https://findtreatment.gov) registry by location, optionally broadened with Google Places results. Providers can be saved for later, called, or opened in directions. The SAMHSA national helpline is one tap away.

**Journal** — a blank page with no prompts, paginated, stored only on the device.

**Settings** — daily reminder times, a privacy lock, "your why" notes, start date, an appointment PDF export, and a delete-everything control.

**Right now** — reachable when a craving hits: a guided breathing exercise, the reasons the user wrote down themselves, their saved providers, and crisis contacts.

**Export summary** — turns check-in history into a PDF for a provider appointment: averages for mood, sleep, and comfort, check-in count, and medication-adherence days. Generated on device and shared only when the user chooses.

## Privacy by architecture

All user data — profile, medications, check-ins, journal entries, wins, saved providers — lives in on-device SQLite. There is no backend and no account, so there is no server holding anyone's medication or craving history.

The app makes exactly two kinds of outbound request, both in the Find Care flow:

- **SAMHSA `findtreatment.gov`** (`api/findTreatment.ts`) — sends a latitude/longitude to search for nearby providers. Nothing identifying is sent.
- **Google Places** (`api/googlePlaces.ts`) — optional. Only runs when an API key is configured; without one the app works normally and simply returns fewer results.

Notifications are local only. There is no push server, and the app never registers for remote push.

## Tech stack

| | |
|---|---|
| Runtime | Expo SDK `~56.0.12`, React Native `0.85.3`, React `19.2.3` |
| Language | TypeScript `~6.0.3` |
| Navigation | Expo Router `~56.2.11` (file-based, typed routes) |
| Persistence | `expo-sqlite` `~56.0.5` (synchronous API) |
| State | Zustand `^5.0.14` — in-memory session state only, hydrated from SQLite |
| Native | `expo-notifications`, `expo-location`, `expo-task-manager`, `expo-sharing` |

## Requirements

- Node.js `22.13.x` or newer
- iOS `16.4+` / Xcode `26.4+`, Android `compileSdkVersion 36`
- `cmake` for iOS builds — `brew install cmake` (Hermes needs it; see Troubleshooting)

## Setup

```bash
npm install
npm run start          # Metro dev server
```

Then run on a device or simulator:

```bash
npm run ios
npm run android
npm run web
```

There is no lint or test script. For a manual typecheck:

```bash
npx tsc --noEmit
```

### Google Places key (optional)

Find Care works without this — it just returns SAMHSA results only.

1. Copy the example env file: `cp .env.example .env.local` (`.env.local` is gitignored).
2. In the [Google Cloud Console](https://console.cloud.google.com/), create a project and enable the **Places API (New)**.
3. Create an API key under **APIs & Services → Credentials**.
4. Restrict it — under **API restrictions** limit it to the Places API. Because Expo inlines `EXPO_PUBLIC_*` variables into the client bundle, this key ships inside the app; an unrestricted key can be extracted and billed against.
5. Put the value in `.env.local` as `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`.

## Project structure

```
app/                    Expo Router routes
  _layout.tsx           root Stack; DB init and onboarding-vs-tabs routing
  (tabs)/               Today (index), Learn, Find Care, Journal, Settings
  onboarding/           onboarding flow
  right-now.tsx         craving support (modal)
  journal-write.tsx     journal composer (modal)
  learn-article.tsx     article reader (modal)
  medication-detail.tsx medication guide (modal)
  why-note.tsx          "your why" editor (modal)
  medications.tsx       medication management
  saved-providers.tsx   saved treatment providers
  wins.tsx              logged wins
  export-summary.tsx    appointment PDF summary
api/                    findTreatment.ts (SAMHSA), googlePlaces.ts
components/
  features/             CheckInWidget, StreakCard, BreathingExercise,
                        ReminderTimesEditor, SearchFilters
  ui/                   Button, Card
constants/theme.ts      dark-only design system: Colors, Typography, Spacing, Radius, Shadow
content/                static copy — articles, medications, healing timeline,
                        check-in responses, reflections
db/index.ts             SQLite schema, additive migrations, and all queries
store/index.ts          Zustand stores (check-in, medication, user)
types/index.ts          shared domain types
hooks/useNotifications.ts
tasks/medicationTask.ts background task for the "I took it" notification action
utils/                  date.ts (local-day helpers), insights.ts (pure trend analysis)
plugins/                withDevFriendlyIOS.js — see Troubleshooting
docs/                   App Store listing copy
```

`@/*` maps to the project root.

## Troubleshooting

**`pod install` fails with "Unable to locate the executable cmake".** Hermes needs `cmake` and it is not a Homebrew or Xcode default. Run `brew install cmake`, then re-run `npx expo run:ios`. If a licensing or `xcodebuild` error follows, run `sudo xcodebuild -license accept` and `xcode-select --install`.

**iOS device builds on a free Apple ID.** `expo-notifications` adds the `aps-environment` push entitlement on every prebuild, which a personal Apple team cannot provision — even though this app only uses local notifications. Xcode 15+ also sandboxes build-phase scripts, which breaks the Expo dev-client bundling step. Both are fixed automatically by `plugins/withDevFriendlyIOS.js` on every prebuild. Do not hand-patch `ios/`; it is generated and gets wiped by `expo prebuild --clean`.

## Architecture notes

[`AGENTS.md`](AGENTS.md) covers the parts worth reading before changing code: Expo SDK 56 API specifics, the startup and routing flow, the deliberate split between SQLite and Zustand, why calendar-day logic must use `utils/date.ts` rather than `toISOString()`, and how the notification task writes to the database.

## Disclaimer

Steady provides educational information and self-tracking tools. It is not a medical device and does not provide medical advice, diagnosis, or treatment. Always consult a licensed healthcare provider about your care.
