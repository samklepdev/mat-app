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
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { ARTICLES } from '../content/articles';

export default function LearnScreen() {
  const clinical = ARTICLES.filter((a) => !a.placeholder);
  const personal = ARTICLES.filter((a) => a.placeholder);

  const openArticle = (id: string) => {
    router.push({ pathname: '/learn-article', params: { id } });
  };

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
