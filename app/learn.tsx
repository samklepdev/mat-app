import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';

// ─── Content ──────────────────────────────────────────────────────────────────

interface Article {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  placeholder?: boolean; // true = user-written content coming soon
}

const ARTICLES: Article[] = [
  {
    id: 'what-is-mat',
    title: 'What is MAT?',
    subtitle: 'The basics — plain language, no stigma',
    content: `Medication-assisted treatment uses FDA-approved medications to treat opioid use disorder. The medications work by targeting the same receptors in the brain that opioids affect — reducing cravings, preventing withdrawal, and blocking the effects of other opioids.

MAT is not a substitute for "real" recovery. It is real recovery.

Every major medical organization — the American Society of Addiction Medicine, the CDC, SAMHSA — recognizes MAT as the most effective treatment for opioid use disorder. The evidence is overwhelming and the stigma is wrong.

People on MAT live full, stable lives. They work, raise families, and contribute to their communities. Their medication is a tool, not a crutch — the same way insulin is a tool for someone with diabetes, not evidence that they haven't truly healed.

If you've been told that MAT doesn't count, or that you need to get off your medication to be "really" in recovery — that's stigma talking, not medicine.`,
  },
  {
    id: 'buprenorphine',
    title: 'How buprenorphine works',
    subtitle: 'Suboxone, Subutex, Sublocade',
    content: `Buprenorphine is a partial opioid agonist — it activates opioid receptors but only partially, creating a ceiling effect that prevents euphoria at higher doses. This makes it both effective and safe.

It eliminates withdrawal symptoms and cravings without producing a high. This is why it works: your brain gets enough opioid receptor activity to feel normal, but not enough to get high.

Common forms include:
• Suboxone — buprenorphine + naloxone (sublingual film or tablet)
• Subutex — buprenorphine alone
• Sublocade — monthly injection, no daily dosing required
• Brixdi — weekly injection

Buprenorphine can be prescribed by a certified doctor and picked up at a regular pharmacy. No daily clinic visits required. This makes it one of the most accessible MAT options available.

The naloxone in Suboxone is there to deter injection — it's largely inactive when taken as prescribed under the tongue.`,
  },
  {
    id: 'methadone',
    title: 'How methadone works',
    subtitle: 'Clinic-based treatment with decades of evidence',
    content: `Methadone is a full opioid agonist that works by fully activating opioid receptors, eliminating withdrawal and cravings. Because it's a full agonist, it requires careful dosing and monitoring.

Methadone for opioid use disorder is dispensed through federally certified opioid treatment programs (OTPs) — clinics where you receive your dose under supervision, at least initially. Over time, stable patients earn take-home doses.

This is not a punishment. It's a safety measure that has evolved over decades of careful research. Methadone has a long half-life and can accumulate in the body — supervised dosing protects patients while treatment is being established.

Methadone has been used to treat opioid use disorder since the 1960s. It is one of the most studied medications in addiction treatment. The evidence for its effectiveness is overwhelming.

For many people — especially those with severe dependence — methadone provides a level of stability that other medications can't. The clinic structure also connects people to counseling and support services.`,
  },
  {
    id: 'naltrexone',
    title: 'How naltrexone works',
    subtitle: 'Vivitrol and oral naltrexone',
    content: `Naltrexone is an opioid antagonist — it blocks opioid receptors entirely, preventing any opioid from having an effect. Unlike buprenorphine and methadone, it has no opioid activity itself and is not habit-forming.

It comes as:
• A daily pill (oral naltrexone)
• A monthly injection (Vivitrol)

Because naltrexone blocks all opioid effects, it must only be started after someone is fully detoxed — taking it while opioids are still in your system causes immediate precipitated withdrawal, which is extremely uncomfortable.

Naltrexone is particularly effective for people who have completed detox and want a medication that removes the option of getting high entirely. It also works for alcohol use disorder.

The monthly Vivitrol injection removes the daily decision of whether to take a pill — once it's in, it's in for 30 days.`,
  },
  {
    id: 'naloxone',
    title: 'Naloxone / Narcan',
    subtitle: 'How to reverse an overdose',
    content: `Naloxone is a fast-acting medication that reverses opioid overdose. It works by knocking opioids off receptors almost instantly, restoring normal breathing within minutes.

It comes as:
• Narcan — nasal spray, no needles required
• Generic naloxone — nasal spray or injection
• Kloxxado — higher-dose nasal spray for fentanyl

It's available without a prescription at most pharmacies. Many harm reduction programs distribute it for free.

If someone is unresponsive, breathing slowly or not at all, and you suspect opioids:

1. Call 911 immediately
2. Give naloxone — one spray in one nostril
3. Put them in the recovery position (on their side)
4. If no response in 2-3 minutes, give a second dose
5. Stay with them until help arrives

Naloxone wears off in 30-90 minutes — shorter than most opioids. Someone can go back into overdose after naloxone wears off. This is why calling 911 matters even if they seem to recover.

You cannot overdose on naloxone. If you give it to someone who isn't overdosing on opioids, it won't harm them.`,
  },
  {
    id: 'fentanyl',
    title: 'The fentanyl epidemic',
    subtitle: 'What happened and why MAT exists because of it',
    content: `This article is being written by someone who lived through it.\n\nComing soon.`,
    placeholder: true,
  },
  {
    id: 'myths',
    title: 'MAT myths',
    subtitle: '"You\'re not really in recovery"',
    content: `This article is being written by someone who lived through it.\n\nComing soon.`,
    placeholder: true,
  },
  {
    id: 'rights',
    title: 'Your rights as a MAT patient',
    subtitle: 'Discrimination protections you should know',
    content: `People on MAT are protected by federal law. Discrimination based on your use of prescribed MAT medications is illegal in most contexts.

The Americans with Disabilities Act (ADA) protects people in recovery from opioid use disorder, including those taking MAT medications as prescribed. This applies to:

Employment
Your employer cannot fire you, refuse to hire you, or discriminate against you because you take buprenorphine or methadone as prescribed. If a drug test is required, you have the right to inform the medical review officer of your prescription before results are reported.

Housing
Landlords cannot refuse to rent to you or evict you because of your MAT medication. The Fair Housing Act provides similar protections.

Healthcare
Healthcare providers cannot refuse to treat you, deny surgery, or withhold pain management solely because you are on MAT. This includes dental care.

What to do if you experience discrimination:
• Document everything in writing
• Contact the ADA National Network: 1-800-949-4232
• File a complaint with the EEOC (employment) or HUD (housing)
• Speak with an attorney who specializes in disability rights

Your medication is legal, prescribed, and protected. You have rights.`,
  },
  {
    id: 'provider-talk',
    title: 'Talking to your provider',
    subtitle: 'How to advocate for yourself',
    content: `Your relationship with your prescriber matters. You have the right to ask questions, express concerns, and be heard.

Questions worth asking:

About your medication:
• "What's the goal for my dose — are we stabilizing, tapering, or maintaining?"
• "What should I do if I miss a dose?"
• "Are there interactions with other medications I should know about?"
• "What side effects should I watch for?"

About your treatment plan:
• "How will we know if this is working?"
• "What does progress look like for me specifically?"
• "How long do you expect I'll be on this medication?"
• "What's the plan if I have a setback?"

If something feels wrong:
You are allowed to disagree with your provider. You are allowed to get a second opinion. You are allowed to change providers.

If a provider tells you that MAT isn't "real" recovery, or pressures you to taper faster than feels right, or dismisses your concerns — find a new provider. You deserve care that takes you seriously.

Your stability is the goal. Not a timeline. Not a number of milestones. Stability.`,
  },
];

// ─── Article modal ────────────────────────────────────────────────────────────

function ArticleModal({
  article,
  onClose,
}: {
  article: Article;
  onClose: () => void;
}) {
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={styles.modalClose}>Done</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.articleTitle}>{article.title}</Text>
          <Text style={styles.articleSubtitle}>{article.subtitle}</Text>
          <View style={styles.divider} />
          <Text style={styles.articleBody}>{article.content}</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function LearnScreen() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const clinical = ARTICLES.filter((a) => !a.placeholder);
  const personal = ARTICLES.filter((a) => a.placeholder);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.title}>Learn</Text>
          <Text style={styles.sub}>
            Straight answers about MAT — no stigma, no steps.
          </Text>
        </View>

        {/* Clinical articles */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MEDICATION & TREATMENT</Text>
          <View style={styles.articleList}>
            {clinical.map((article) => (
              <TouchableOpacity
                key={article.id}
                style={styles.articleCard}
                onPress={() => setSelectedArticle(article)}
                activeOpacity={0.75}
              >
                <View style={styles.articleCardContent}>
                  <Text style={styles.cardTitle}>{article.title}</Text>
                  <Text style={styles.cardSubtitle}>{article.subtitle}</Text>
                </View>
                <Text style={styles.cardChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Personal articles — placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LIVED EXPERIENCE</Text>
          <View style={styles.articleList}>
            {personal.map((article) => (
              <TouchableOpacity
                key={article.id}
                style={[styles.articleCard, styles.articleCardPlaceholder]}
                onPress={() => setSelectedArticle(article)}
                activeOpacity={0.75}
              >
                <View style={styles.articleCardContent}>
                  <Text style={styles.cardTitle}>{article.title}</Text>
                  <Text style={styles.cardSubtitle}>{article.subtitle}</Text>
                </View>
                <Text style={styles.comingSoon}>Soon</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  backRow: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  backButton: { fontSize: 16, color: Colors.primary },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.xl },
  title: { ...Typography.h1, marginBottom: 4 },
  sub: { ...Typography.bodySmall, lineHeight: 20 },

  section: { gap: Spacing.sm },
  sectionLabel: {
    ...Typography.eyebrow,
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
  articleList: { gap: Spacing.sm },
  articleCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  articleCardPlaceholder: {
    opacity: 0.6,
  },
  articleCardContent: { flex: 1, gap: 2 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  cardChevron: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  comingSoon: {
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },

  // Modal
  modalSafe: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    alignItems: 'flex-end',
  },
  modalClose: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  modalContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  articleTitle: { ...Typography.h1 },
  articleSubtitle: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  articleBody: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
});
