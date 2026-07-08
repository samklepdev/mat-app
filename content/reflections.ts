// Daily reflections — one short read per day, rotating deterministically
// by date so everyone sees the same reflection on the same day and it
// never repeats two days in a row. 30-second reads. MAT-affirming voice.

export interface Reflection {
  id: number;
  text: string;
  theme: 'science' | 'perspective' | 'history' | 'body';
}

export const REFLECTIONS: Reflection[] = [
  { id: 1, theme: 'perspective', text: 'Methadone maintenance has existed since 1964. Sixty years of evidence. The people who tell you medication is not recovery are arguing with six decades of science.' },
  { id: 2, theme: 'science', text: 'Opioid use disorder changes brain structure — and so does treatment. Neuroplasticity works in both directions. Every stable day is construction, not just abstinence.' },
  { id: 3, theme: 'body', text: 'Your body kept you alive through everything you put it through. Today it is healing. It never stopped being on your side.' },
  { id: 4, theme: 'perspective', text: 'Nobody tells a person with diabetes that insulin is a crutch. Your medication treats a chronic condition. Full stop.' },
  { id: 5, theme: 'history', text: 'Buprenorphine was approved for OUD in 2002 after decades of research. It was designed for exactly this — a ceiling effect that stabilizes without impairing. You are using the tool as intended.' },
  { id: 6, theme: 'science', text: 'The strongest predictor of long-term recovery is not willpower. It is treatment retention. Staying on your medication is the evidence-based path, whatever anyone in a church basement says.' },
  { id: 7, theme: 'body', text: 'Stability feels boring some days. Boring is your nervous system no longer bracing for impact. Boring is the win.' },
  { id: 8, theme: 'perspective', text: 'Recovery is not the absence of a substance. It is the presence of a life. Rent paid, calls returned, mornings that start on time — that is what recovery is made of.' },
  { id: 9, theme: 'science', text: 'MAT cuts overdose death risk by half or more. Whatever stigma someone attaches to your medication, it is outweighed by that single number.' },
  { id: 10, theme: 'body', text: 'Cravings are memories, not commands. Your brain rehearsing an old route does not mean you have to drive it.' },
  { id: 11, theme: 'history', text: 'Naloxone was patented in 1961 and has reversed hundreds of thousands of overdoses. Harm reduction is not enabling. It is people refusing to let other people die.' },
  { id: 12, theme: 'perspective', text: 'You do not owe anyone a timeline for your treatment. Not family, not friends, not people in meetings. Your dose is between you and your prescriber.' },
  { id: 13, theme: 'science', text: 'Sleep is when your brain consolidates recovery — literally. The repairs happen at night. Protecting your sleep is protecting your treatment.' },
  { id: 14, theme: 'body', text: 'Some days the only data point that matters is: still here. Log it and let that be enough.' },
  { id: 15, theme: 'perspective', text: 'The opposite of addiction is not sobriety. It is connection — to your own body, your own mornings, your own people. Medication clears the ground for that. You build the rest.' },
  { id: 16, theme: 'science', text: 'Stress is the most common relapse trigger — and stable medication blunts the stress response itself. Your treatment is working even on the days you cannot feel it.' },
  { id: 17, theme: 'history', text: 'France put buprenorphine in general practice in 1995 and overdose deaths dropped nearly 80 percent in four years. The evidence has been in for a generation.' },
  { id: 18, theme: 'body', text: 'Appetite coming back. Music sounding right again. A real laugh. These are clinical signs of receptor recovery — and they are also just your life returning.' },
  { id: 19, theme: 'perspective', text: 'Progress in recovery is measured in ordinary Tuesdays, not dramatic turnarounds. If today was ordinary, today was progress.' },
  { id: 20, theme: 'science', text: 'The brain regions that recover last are the ones that plan and imagine the future. If hoping feels new, that is not naivety — that is healing tissue.' },
  { id: 21, theme: 'body', text: 'Drink the water. Eat the meal. Take the walk. Recovery lives in the small physical kindnesses that used to be impossible.' },
  { id: 22, theme: 'perspective', text: 'Half measures availed us nothing — and medication is not a half measure. It is the full, evidence-backed measure. You took it seriously enough to treat it properly.' },
  { id: 23, theme: 'history', text: 'The waiver requirement to prescribe buprenorphine was eliminated in 2023. The medical establishment is finally catching up to what patients always knew: access saves lives.' },
  { id: 24, theme: 'science', text: 'Consistency beats intensity. One check-in a day for a month rewires more than any single act of willpower ever could.' },
  { id: 25, theme: 'body', text: 'Your heart rate is steadier than it was six months ago. Your breathing is deeper. The healing you cannot see is still healing.' },
  { id: 26, theme: 'perspective', text: 'Stigma is a public health problem, not a personal verdict. When someone shames your medication, that is their ignorance talking — not your recovery failing.' },
  { id: 27, theme: 'science', text: 'Craving intensity peaks and passes in about 20 minutes. It is a wave, not a tide. You have already outlasted hundreds of them.' },
  { id: 28, theme: 'body', text: 'Rest is not laziness in recovery. Your body is running repair processes that take real energy. Tired days are working days.' },
  { id: 29, theme: 'perspective', text: 'The person who started this treatment made a harder choice than anyone around them may ever understand. Be as kind to yourself as you would be to them.' },
  { id: 30, theme: 'history', text: 'Every generation of recovery has fought the last generation\u2019s stigma. Methadone patients fought it. Buprenorphine patients fought it. You are part of that lineage — and it bends toward evidence.' },
];

// Deterministic daily selection: same reflection for everyone on a given date,
// cycles through the full list, no repeats until the cycle completes.
export function getTodaysReflection(date: Date = new Date()): Reflection {
  const epochDays = Math.floor(date.getTime() / 86400000);
  return REFLECTIONS[epochDays % REFLECTIONS.length];
}
