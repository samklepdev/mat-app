// Body healing timeline — day-by-day recovery science.
// Each entry surfaces on its matching day (or range) of consistent treatment.
// Grounded in published recovery/neuroscience research; written in the app's
// body-first, dignity-first voice. Not medical advice — general education.

export interface HealingMilestone {
  dayStart: number;   // first day this entry can show
  dayEnd: number;     // last day (inclusive) — allows ranges
  title: string;
  body: string;
}

export const HEALING_TIMELINE: HealingMilestone[] = [
  {
    dayStart: 1, dayEnd: 2,
    title: 'Day one. Your body noticed.',
    body: 'Stabilizing on medication means your brain is no longer riding the spike-and-crash cycle. Receptors that were flooded and starved on repeat are getting something they have not had in a long time: consistency.',
  },
  {
    dayStart: 3, dayEnd: 5,
    title: 'Your stress system is recalibrating.',
    body: 'The first days of stability lower cortisol chaos. Your fight-or-flight system — stuck in the on position during active use — is starting to learn it can stand down.',
  },
  {
    dayStart: 6, dayEnd: 9,
    title: 'Sleep architecture is rebuilding.',
    body: 'Opioid use suppresses REM sleep. As you stabilize, REM rebounds — which is why dreams can feel intense right now. Vivid dreams are not a warning sign. They are your brain catching up on repairs it deferred.',
  },
  {
    dayStart: 10, dayEnd: 13,
    title: 'Digestion is waking up.',
    body: 'Your gut has more opioid receptors than almost anywhere outside your brain. Stable, appropriate dosing lets digestion normalize — appetite and regularity slowly returning is your enteric nervous system healing.',
  },
  {
    dayStart: 14, dayEnd: 20,
    title: 'Two weeks. Your baseline is forming.',
    body: 'The daily swings are flattening into something steadier. This is what your medication is for — not a high, not numbness. A floor. Something to build on.',
  },
  {
    dayStart: 21, dayEnd: 29,
    title: 'Natural reward is coming back online.',
    body: 'Dopamine receptors downregulated by heavy use begin recovering in these weeks. Food tasting better, music hitting different, a laugh landing — small signals that your capacity for ordinary pleasure is regrowing.',
  },
  {
    dayStart: 30, dayEnd: 44,
    title: 'One month of consistency.',
    body: 'Research on MAT shows the first 30 days of retention are the hardest and most important — people who reach this point are significantly more likely to remain stable long-term. You are past the steepest part of the curve.',
  },
  {
    dayStart: 45, dayEnd: 59,
    title: 'Your prefrontal cortex is doing more of the driving.',
    body: 'Decision-making, impulse control, planning — the parts of the brain hijacked by addiction — strengthen with every week of stability. Choices that felt impossible months ago are becoming just choices.',
  },
  {
    dayStart: 60, dayEnd: 89,
    title: 'Two months. Deep repair is underway.',
    body: 'Neuroplasticity research shows meaningful structural recovery in white matter and grey matter density beginning around this window. Your brain is not just functioning better — it is physically rebuilding.',
  },
  {
    dayStart: 90, dayEnd: 179,
    title: 'Three months of showing up.',
    body: 'Sleep, mood, energy and stress response have had time to establish a genuinely new baseline. The clinical term is stabilization. The human term is: this is who you are now, not who you are trying to be.',
  },
  {
    dayStart: 180, dayEnd: 364,
    title: 'Six months. Quiet and consistent.',
    body: 'At this point, treatment retention research puts you in the group with the strongest long-term outcomes. The work is less visible now — which is exactly the point. Stability is supposed to feel ordinary.',
  },
  {
    dayStart: 365, dayEnd: 394,
    title: 'One year.',
    body: 'A full year of consistent treatment. Every system that addiction disrupted — sleep, stress, reward, digestion, decision-making — has had a year to heal. You did not white-knuckle this. You treated it, like the medical condition it is.',
  },
  {
    dayStart: 395, dayEnd: 422,
    title: 'Thirteen months. Your immune system remembers.',
    body: 'Chronic opioid use suppresses immune function — it is part of why people in active addiction get sick more and heal slower. More than a year into stability, immune markers in long-term MAT research trend back toward baseline. Your body is not just steady now. It is better defended.',
  },
  {
    dayStart: 423, dayEnd: 450,
    title: 'Your heart is working less hard.',
    body: 'Sustained stress and chaotic substance use both strain the cardiovascular system — elevated resting heart rate, blunted heart-rate variability. Over a year-plus of stability, that variability tends to improve, a sign your nervous system is spending less time in fight-or-flight.',
  },
  {
    dayStart: 451, dayEnd: 478,
    title: 'Fourteen-plus months. Worth a check-up.',
    body: 'Long-term opioid use is linked to lower bone density, especially with methadone. It is not a reason for alarm — it is a reason to ask your provider about it at your next visit. Stability is exactly what makes it possible to think about maintenance, not just survival.',
  },
  {
    dayStart: 479, dayEnd: 506,
    title: 'Your liver has had time to catch up.',
    body: 'Without the metabolic load of unpredictable substances, liver enzyme levels typically normalize well within the first year or two of stable treatment. One more system that was quietly absorbing the cost of instability — now just running normally.',
  },
  {
    dayStart: 507, dayEnd: 534,
    title: 'Trust is a rebuildable circuit.',
    body: 'Oxytocin and social-reward pathways — the neural systems behind bonding and trust — are disrupted by chronic addiction and measurably recover with sustained stability. If reconnecting with people has felt slowly easier, that is not just circumstance. That is neurobiology.',
  },
  {
    dayStart: 535, dayEnd: 562,
    title: 'Eighteen months. Decisions feel more like decisions.',
    body: 'Research on prefrontal cortex recovery points to the 12-to-18 month window as where executive function — planning, impulse control, weighing consequences — reaches a substantially restored baseline for many people in sustained treatment. The part of your brain that gets to be in charge again is more in charge than it has been in a long time.',
  },
  {
    dayStart: 563, dayEnd: 590,
    title: 'Your sleep architecture has settled.',
    body: 'The REM rebound that felt intense in early stability has long since leveled out. By this point, deep sleep and REM cycles typically run on a normal, regular rhythm — the quiet infrastructure that everything else, mood included, is built on.',
  },
  {
    dayStart: 591, dayEnd: 618,
    title: 'Your stress response is recalibrated.',
    body: 'The HPA axis — your body’s central stress-response system — is chronically dysregulated by addiction, running hot even when nothing is wrong. Sustained treatment brings cortisol reactivity closer to a non-dependent baseline. Stressful days still happen. They just do not hijack you the way they used to.',
  },
  {
    dayStart: 619, dayEnd: 646,
    title: 'The gut-brain connection is still healing.',
    body: 'Your gut microbiome — which communicates directly with mood-regulating circuits in the brain — is disrupted by chronic opioid use and takes real time to recover. Appetite and digestion evening out over this past year and a half is not a side note. It is part of how your mood has been getting steadier too.',
  },
  {
    dayStart: 647, dayEnd: 674,
    title: 'Emotional reactivity keeps softening.',
    body: 'Amygdala reactivity — how sharply your brain fires off alarm in response to stress or triggers — measurably decreases with sustained recovery. It is a big part of why things that used to feel like emergencies increasingly just feel like inconveniences.',
  },
  {
    dayStart: 675, dayEnd: 702,
    title: 'Recovery capital is a real, growing thing.',
    body: 'Researchers use the term "recovery capital" for the accumulated resources — relationships, stability, skills, health — that make continued recovery more sustainable over time. Nearly two years in, yours is not an abstraction. It is the job, the routine, the people who trust you again. It compounds.',
  },
  {
    dayStart: 703, dayEnd: 729,
    title: 'Two years.',
    body: 'Two years of consistent treatment. Long-term outcome research consistently shows this length of retention among the strongest predictors of lasting stability. You are not still recovering from something. You are living a life that happens to include taking your medication.',
  },
];

// ─── Long-term milestones (day 730+) ──────────────────────────────────────────
// The hand-authored timeline above covers the first two years in detail. Past
// that, we never want the app to just go quiet — so long-term users get two
// kinds of milestone instead: a specific note on each yearly anniversary, and
// a rotating "season" of body-science content in between, so the healing card
// never repeats the exact same thing two quarters in a row and never runs dry.

const ANNIVERSARY_CONTENT: Record<number, { title: string; body: string }> = {
  3: {
    title: 'Three years.',
    body: 'Three years of treatment most people would call a lifelong condition managed exactly the way it should be. The version of you that started this could not have fully pictured this version. You do not have to picture what comes next either. You just have to keep showing up, the way you have been.',
  },
  4: {
    title: 'Four years.',
    body: 'Four years in, stability research stops calling this "early recovery" and starts calling it what it is: your life. Whatever still feels effortful about staying consistent, it is worth naming — you have earned the right to make this easier, not just to keep enduring it.',
  },
  5: {
    title: 'Five years.',
    body: 'Five years is the marker a lot of long-term outcome studies use to call a remission durable. Not cured — durable, the same word used for any well-managed chronic condition. That is the honest, unglamorous, real thing you have built.',
  },
  6: {
    title: 'Six years.',
    body: 'Six years is long enough that the hardest early stretch is now a minority of the time you have spent in treatment. The math has quietly flipped: more of your life has been steady than shaky. That ratio only keeps improving from here.',
  },
  7: {
    title: 'Seven years.',
    body: 'Seven years of a body that gets consistency instead of chaos. Most of what addiction disrupted has had time not just to recover but to become unremarkable again — which, after everything, might be the actual goal.',
  },
  8: {
    title: 'Eight years.',
    body: 'Eight years means the version of you managing this today has more practice at it than almost anything else you do. Whatever still takes effort about staying consistent, you are not starting from scratch on it — you never really are, this far in.',
  },
  9: {
    title: 'Nine years.',
    body: 'Nine years in, the people who matter to you have known this version of you — steady, present, showing up — for nearly a decade. That is not a phase anyone is still waiting to pass. It is just who you have been, for a long time now.',
  },
  10: {
    title: 'Ten years.',
    body: 'A decade of treatment. Whatever brought you here, a decade ago, is not who is opening this app today. Ten years of showing up is not a footnote to your life. For a very long time now, it has just been how you live it.',
  },
};

const SEASONAL_MILESTONES: { title: string; body: string }[] = [
  {
    title: 'Still protecting your heart.',
    body: 'Cardiovascular recovery from the stress load of active addiction is not a one-time event — the lower resting heart rate and healthier stress response sustained treatment supports keep compounding for as long as you stay stable. This is still paying off.',
  },
  {
    title: 'Your brain is still consolidating.',
    body: 'Neuroplasticity research on long-term recovery finds continued, gradual gains in white-matter integrity and cognitive flexibility well beyond the two-year mark. The rebuilding did not stop. It just got quiet.',
  },
  {
    title: 'Relationships are still the evidence.',
    body: 'Trust, once badly damaged, tends to rebuild slowly and then all at once. If people who once kept their distance now just treat you normally — that ordinary treatment is itself a kind of proof.',
  },
  {
    title: 'Your stress response, still recalibrated.',
    body: 'The nervous system regulation built through sustained MAT does not expire — it is maintained by the exact thing you are still doing. Every day on stable treatment is still a day your body is not running on emergency settings.',
  },
  {
    title: 'Sleep, still doing its quiet work.',
    body: 'Deep, regular sleep continues to be one of the most consistent predictors of sustained recovery in long-term follow-up studies. If it still feels unremarkable, that is exactly what healthy sleep is supposed to feel like.',
  },
  {
    title: 'Recovery capital keeps compounding.',
    body: 'Every additional season of stability adds to the resources — routines, relationships, self-trust — that make the next season easier than the last. It is not dramatic. It is just quietly true.',
  },
];

function getLongTermMilestone(day: number): HealingMilestone {
  const years = Math.floor(day / 365);
  const dayOfYear = day % 365;

  // Fire a specific anniversary note for a few days around the actual anniversary.
  if (dayOfYear <= 4 && ANNIVERSARY_CONTENT[years]) {
    const content = ANNIVERSARY_CONTENT[years];
    return { dayStart: day, dayEnd: day, ...content };
  }

  // Otherwise, rotate through the seasonal pool roughly every 91 days (a
  // "season"), cycling indefinitely so the card never runs out of things
  // to say, however many years someone has been on this screen.
  const seasonIndex = Math.floor(day / 91) % SEASONAL_MILESTONES.length;
  const content = SEASONAL_MILESTONES[seasonIndex];
  return { dayStart: day, dayEnd: day, ...content };
}

export function getMilestoneForDay(day: number): HealingMilestone | null {
  if (day < 1) return null;

  const fromTimeline = HEALING_TIMELINE.find(
    (m) => day >= m.dayStart && day <= m.dayEnd
  );
  if (fromTimeline) return fromTimeline;

  return getLongTermMilestone(day);
}
