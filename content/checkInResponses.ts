// What shows up right after finishing a check-in. Previously this was a
// single static "Logged. See you tomorrow." regardless of what was actually
// logged — no payoff, no acknowledgment. This gives the check-in an
// immediate response tuned to how the day was actually rated, so finishing
// it feels like it did something.

export interface CheckInResponse {
  title: string;
  body: string;
}

// Mood or comfort rated low (1-2 on the 1-5 scale). Supportive, not alarmed —
// the goal is to acknowledge a hard entry without treating it as a crisis.
const ROUGH_DAY_RESPONSES: CheckInResponse[] = [
  {
    title: 'That took something.',
    body: 'Logging a hard day honestly is still showing up. Cravings peak and fade — usually within about twenty minutes. You are not stuck here.',
  },
  {
    title: 'Noted. Not judged.',
    body: 'A rough entry is data, not a verdict on how you are doing overall. Tomorrow gets its own check-in.',
  },
  {
    title: 'This one counts too.',
    body: 'Some of the most important days to log are the hard ones. You told the truth instead of skipping it. That matters.',
  },
];

// Mood and comfort both rated high (4-5). Small-win framing, deliberately
// undramatic — the app's stance is that ordinary steady days are the real work.
const GOOD_DAY_RESPONSES: CheckInResponse[] = [
  {
    title: 'Logged. Feels good to say that.',
    body: 'Not every day has to be dramatic to count. Steady days are the ones building the life underneath everything else.',
  },
  {
    title: 'Another one in the books.',
    body: 'The stack of good, ordinary days is quietly doing more for you than any single big moment could.',
  },
  {
    title: 'That is worth noticing.',
    body: 'A day that felt genuinely okay is not nothing. It is the thing all of this is for.',
  },
];

const NEUTRAL_RESPONSE: CheckInResponse = {
  title: 'Logged.',
  body: 'See you tomorrow.',
};

export function getCheckInResponse(
  data: { mood: number; sleep: number; cravings: number },
  variant: number
): CheckInResponse {
  const isRough = data.mood <= 2 || data.cravings <= 2;
  const isGood = data.mood >= 4 && data.cravings >= 4;

  const pool = isRough
    ? ROUGH_DAY_RESPONSES
    : isGood
      ? GOOD_DAY_RESPONSES
      : null;

  if (!pool) return NEUTRAL_RESPONSE;
  return pool[((variant % pool.length) + pool.length) % pool.length];
}
