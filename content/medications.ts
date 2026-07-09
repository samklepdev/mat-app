// Plain-language explanations of MAT medications, written for someone who has
// never heard of them — the person still using, googling at 3am, scared.
// Each medication links to real, authoritative studies so the information is
// trustworthy when you're deciding whether to trust a medication with your life.

export interface StudyLink {
  label: string;
  source: string;
  url: string;
}

export interface MedicationInfo {
  id: string;
  name: string;
  alsoKnownAs: string;
  oneLiner: string;
  whatItIs: string;
  howItHelps: string;
  whatToExpect: string;
  studies: StudyLink[];
}

export const MEDICATIONS: MedicationInfo[] = [
  {
    id: 'buprenorphine',
    name: 'Buprenorphine',
    alsoKnownAs: 'Suboxone, Subutex, Sublocade, Zubsolv',
    oneLiner: 'Stops withdrawal and cravings without getting you high.',
    whatItIs:
      'Buprenorphine is a medication that attaches to the same receptors in your brain that opioids like fentanyl and heroin use — but only partially. It settles those receptors down instead of flooding them. Because of something called a "ceiling effect," taking more of it past a certain point does nothing extra, which is a big part of why it is so much safer than the drugs it replaces.',
    howItHelps:
      'It takes away withdrawal sickness and the constant pull of cravings, without the high and without the crash. That means you can think, work, sleep, and live a normal day. For a lot of people it is the first time in a long time their body feels steady. It also blocks other opioids from working while it is in your system, which lowers overdose risk dramatically.',
    whatToExpect:
      'It is usually a film or tablet that dissolves under your tongue, or a monthly injection (Sublocade). A doctor, nurse practitioner, or PA can prescribe it — you pick it up at a normal pharmacy, no daily clinic visits required. One important thing: you usually need to be in early withdrawal before your first dose, or it can bring on withdrawal (called precipitated withdrawal). Your prescriber will walk you through the timing.',
    studies: [
      {
        label: 'Buprenorphine cuts the risk of death — large cohort review',
        source: 'BMJ, 2017',
        url: 'https://www.bmj.com/content/357/bmj.j1550',
      },
      {
        label: 'Cochrane review: buprenorphine for opioid dependence',
        source: 'Cochrane Database of Systematic Reviews',
        url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD002207.pub4/full',
      },
      {
        label: 'What buprenorphine is and how it works',
        source: 'SAMHSA',
        url: 'https://www.samhsa.gov/substance-use/treatment/statutes-regulations-guidelines/buprenorphine',
      },
    ],
  },
  {
    id: 'methadone',
    name: 'Methadone',
    alsoKnownAs: 'Dolophine, Methadose',
    oneLiner: 'A long-acting medicine that holds withdrawal off for a full day.',
    whatItIs:
      'Methadone is a full opioid medication, but a slow, long-acting one. Taken once a day at a steady dose, it keeps your opioid receptors satisfied evenly for about 24 hours — no rush, no high, no crash. It has been used to treat opioid addiction since the 1960s and is one of the most studied medicines in all of addiction treatment.',
    howItHelps:
      'It completely stops withdrawal and cravings for the whole day on a stable dose. For people with a heavy, long-term dependence — especially on fentanyl — methadone is often the medication that finally holds when others have not. The daily clinic structure also connects you to counseling and people who understand what you are going through.',
    whatToExpect:
      'Methadone for addiction is dispensed through certified opioid treatment programs (OTPs) — you go to the clinic for your dose, especially at first. That is not a punishment; it is a safety step because methadone builds up slowly in the body. As you stabilize, you earn take-home doses and go less often. Many people eventually only visit once or twice a week.',
    studies: [
      {
        label: 'Cochrane review: methadone maintenance vs no medication',
        source: 'Cochrane Database of Systematic Reviews',
        url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD002209.pub2/full',
      },
      {
        label: 'Methadone and buprenorphine reduce overdose death',
        source: 'BMJ, 2017',
        url: 'https://www.bmj.com/content/357/bmj.j1550',
      },
      {
        label: 'How methadone treatment works',
        source: 'SAMHSA',
        url: 'https://www.samhsa.gov/substance-use/treatment/statutes-regulations-guidelines/methadone',
      },
    ],
  },
  {
    id: 'naltrexone',
    name: 'Naltrexone',
    alsoKnownAs: 'Vivitrol, ReVia',
    oneLiner: 'Blocks opioids entirely — if you use, you feel nothing.',
    whatItIs:
      'Naltrexone is different from the other two. It is not an opioid at all. It is a blocker: it sits on your opioid receptors and stops anything else from attaching to them. It is not addictive and there is no withdrawal when you stop it. It comes as a daily pill or, more commonly, a once-a-month injection called Vivitrol.',
    howItHelps:
      'Because it fully blocks opioid receptors, using opioids while on naltrexone produces no high at all — which removes a lot of the point of using and helps break the cycle. For people who have already gotten through detox and want a medication that simply takes the option off the table, it can be a good fit. The monthly shot also means no daily decision to make.',
    whatToExpect:
      'This is the key difference: you have to be fully off opioids — usually 7 to 14 days — before you can start naltrexone, or it will throw you into hard withdrawal. That detox requirement is the main hurdle. Once you are past it, the monthly injection is straightforward and does not require a special clinic.',
    studies: [
      {
        label: 'Extended-release naltrexone vs buprenorphine (X:BOT trial)',
        source: 'The Lancet, 2018',
        url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(17)32812-X/fulltext',
      },
      {
        label: 'Injectable naltrexone for opioid dependence',
        source: 'New England Journal of Medicine',
        url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1505409',
      },
      {
        label: 'How naltrexone works',
        source: 'SAMHSA',
        url: 'https://www.samhsa.gov/substance-use/treatment/statutes-regulations-guidelines/naltrexone',
      },
    ],
  },
  {
    id: 'naloxone',
    name: 'Naloxone',
    alsoKnownAs: 'Narcan, Kloxxado',
    oneLiner: 'Reverses an overdose in minutes. Not treatment — a rescue.',
    whatItIs:
      'Naloxone is an emergency medicine that reverses an opioid overdose. It knocks opioids off the brain\u2019s receptors almost instantly and restores breathing. It is not a treatment for addiction and it is not something you take daily — it is something you and the people around you keep on hand in case of an overdose. It comes as a simple nasal spray (Narcan).',
    howItHelps:
      'It saves lives, full stop. In the fentanyl era, overdoses happen fast and often, and naloxone is the single thing most likely to keep someone alive long enough to get help. Having it — and making sure people around you know where it is — is one of the most important harm-reduction steps you can take, whether for yourself or someone you love.',
    whatToExpect:
      'You can get naloxone without a prescription at most pharmacies, and free through many harm-reduction programs. If someone is unresponsive and breathing slowly or not at all: call 911, spray one dose in one nostril, put them on their side, and give a second dose after 2 to 3 minutes if there is no response. It only works on opioids, but it will not hurt someone if opioids turn out not to be involved. You cannot overdose on it.',
    studies: [
      {
        label: 'Naloxone access and overdose mortality',
        source: 'JAMA Network Open',
        url: 'https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2758476',
      },
      {
        label: 'Community naloxone distribution saves lives',
        source: 'Cochrane / WHO evidence',
        url: 'https://www.who.int/publications/i/item/9789241548816',
      },
      {
        label: 'How to use naloxone',
        source: 'SAMHSA',
        url: 'https://www.samhsa.gov/substance-use/treatment/naloxone',
      },
    ],
  },
];

export function getMedicationById(id: string): MedicationInfo | undefined {
  return MEDICATIONS.find((m) => m.id === id);
}
