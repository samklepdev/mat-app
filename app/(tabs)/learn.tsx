import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { ARTICLES } from '../../content/articles';

export default function LearnScreen() {
  const clinical = ARTICLES.filter((a) => !a.placeholder);
  const personal = ARTICLES.filter((a) => a.placeholder);

  const openArticle = (id: string) => {
    router.push({ pathname: '/learn-article', params: { id } });
  };

  return (
    <SafeAreaView style={styles.safe}>

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

        {/* The medicines — front door for someone just starting to look */}
        <TouchableOpacity
          style={styles.medicinesCard}
          onPress={() => router.push('/medications')}
          activeOpacity={0.8}
        >
          <Text style={styles.medicinesEyebrow}>START HERE</Text>
          <Text style={styles.medicinesTitle}>The medicines</Text>
          <Text style={styles.medicinesBody}>
            Never heard of buprenorphine, methadone, or naltrexone? Plain answers about the medications that treat opioid addiction — and the science behind them.
          </Text>
          <Text style={styles.medicinesArrow}>Explore →</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MEDICATION & TREATMENT</Text>
          <View style={styles.articleList}>
            {clinical.map((article) => (
              <TouchableOpacity
                key={article.id}
                style={styles.articleCard}
                onPress={() => openArticle(article.id)}
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

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LIVED EXPERIENCE</Text>
          <View style={styles.articleList}>
            {personal.map((article) => (
              <View
                key={article.id}
                style={[styles.articleCard, styles.articleCardPlaceholder]}
              >
                <View style={styles.articleCardContent}>
                  <Text style={styles.cardTitle}>{article.title}</Text>
                  <Text style={styles.cardSubtitle}>{article.subtitle}</Text>
                </View>
                <Text style={styles.comingSoon}>Soon</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.xl },
  title: { ...Typography.h1, marginBottom: 4 },
  sub: { ...Typography.bodySmall, lineHeight: 20 },
  medicinesCard: {
    backgroundColor: Colors.primaryDim,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: 6,
  },
  medicinesEyebrow: {
    ...Typography.eyebrow,
    color: Colors.primaryLight,
    letterSpacing: 1.2,
  },
  medicinesTitle: {
    ...Typography.h2,
    fontWeight: '500',
  },
  medicinesBody: {
    ...Typography.bodySmall,
    lineHeight: 20,
  },
  medicinesArrow: {
    fontSize: 14,
    color: Colors.primaryLight,
    fontWeight: '600',
    marginTop: 4,
  },
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
  articleCardPlaceholder: { opacity: 0.6 },
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
  cardChevron: { fontSize: 20, color: Colors.textMuted },
  comingSoon: {
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
});
