# App Store listing — "Steady"

## Naming decision

**App name: Steady** (not "MAT Tracker," "MATStay," or similar).

Reasoning:

- **Discretion is a feature, not a loss.** Stigma is central to what this app pushes back on — people are told medication isn't "real" recovery. An app named after the medication category sits on someone's home screen announcing their medical status to anyone who glances at their phone (a roommate, a date, a coworker, a parent). "Steady" reveals nothing. For a population that faces real discrimination in housing, employment, and healthcare, that privacy is protective, not cosmetic.
- **"Steady" says what the app is for, not what condition you have.** MAT is the mechanism; steadiness is the goal. Naming it after the medication category defines users by their diagnosis. Naming it "Steady" defines them by what they're building — the same reframe the whole app is built around ("not a tool to manage a problem — a mirror that reflects back: you are stable").
- **Discoverability is the one real tradeoff, and it's solved elsewhere.** App Store search (people typing "MAT app," "methadone tracker," etc.) is handled by the subtitle and keywords, not the name — so "Steady" stays clean and dignified on the home screen while the store listing still surfaces it to the person searching at 3am.

## Listing copy

**App Name**
Steady

**Subtitle** (30 char max)
Recovery support for MAT — 24 chars

Alternatives considered:
- Your MAT recovery companion — 27 chars, warmer, "companion" signals daily support
- Steady support for MAT — 22 chars
- MAT recovery, on your terms — 27 chars, echoes the autonomy theme

**Keywords** (100 char max, comma-separated, no spaces after commas — Apple indexes name/subtitle words automatically so they're deliberately excluded here)
```
methadone,buprenorphine,suboxone,sublocade,opioid,addiction,sobriety,craving,checkin,vivitrol
```
(99 characters)

**Promotional Text** (170 char max, updatable anytime without app review)
> The recovery app that treats medication as real recovery. Daily check-ins, provider search, and support for the hard moments — private, on your device.

**Description**

> Steady is built for people on medication-assisted treatment — by someone who's been there.
>
> Not a tool to manage a problem. A place that reflects back what's true: you're stable, you're consistent, you're doing the work.
>
> Medication-assisted treatment is real recovery. Steady is built on that belief, top to bottom. No day-one counters. No shame. No language that treats your medication as anything less than the legitimate, evidence-based care it is.
>
> **Check in daily**
> A simple daily check-in tracks how you're feeling — mood, sleep, and steadiness — in about twenty seconds. Over time, Steady shows you your own patterns, so the small consistent work becomes something you can actually see.
>
> **Understand your body's healing**
> Every day surfaces something true about what your body is doing as it heals, grounded in recovery science. The work you can't see, made visible.
>
> **Find care near you**
> Search for treatment providers by location, save the ones that matter, and keep their details one tap away.
>
> **Learn the facts**
> Plain-language guides to buprenorphine, methadone, naltrexone, and naloxone — what they are, how they help, and the science behind them, with links to real research. If you're just starting to look for a way out, start here.
>
> **A private journal**
> A blank page whenever you need it. No prompts, no rules. Your words stay yours, stored only on your device.
>
> **Support for the hard moments**
> When a craving hits, one tap opens a calm space: a guided breath, your reasons, and the people who can help — right when you need them.
>
> **Bring your progress to appointments**
> Generate a clean summary of your check-ins and medication consistency to share with your provider — patient-controlled, and only when you choose.
>
> **Your data stays yours**
> Steady keeps everything on your device. No account required. No tracking. No selling your information. Delete everything anytime.
>
> Recovery is getting a life back. Steady is here for the daily work of it.
>
> *Steady provides educational information and self-tracking tools. It is not a medical device and does not provide medical advice, diagnosis, or treatment. Always consult a licensed healthcare provider about your care.*

## Compliance note

Apple's (and Apple's medical-app review's) stance on medical claims is strict. Keep listing language supportive — "support for," "track," "find care" — and avoid anything that reads as a treatment or outcome claim ("reduces cravings," "improves recovery rates"). The copy above is written to stay on the safe side of that line; re-check this if the description is edited later.

## Still needed before submission

- Screenshots (the description above assumes these come next)
- Actually renaming the app from `mat-app`/"mat-app" to "Steady" in `app.json` (`name`, `slug`) and possibly the bundle identifier — not yet done as of this writing
