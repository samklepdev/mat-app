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
    dayStart: 365, dayEnd: 100000,
    title: 'A year and beyond.',
    body: 'A full year of consistent treatment. Every system that addiction disrupted — sleep, stress, reward, digestion, decision-making — has had a year to heal. You did not white-knuckle this. You treated it, like the medical condition it is.',
  },
];

export function getMilestoneForDay(day: number): HealingMilestone | null {
  return (
    HEALING_TIMELINE.find((m) => day >= m.dayStart && day <= m.dayEnd) ?? null
  );
}
