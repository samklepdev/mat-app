import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { getMedicationById } from '../content/medications';

export default function MedicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const med = getMedicationById(id ?? '');

  if (!med) {
    return (
      <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.done}>Done</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.done}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.name}>{med.name}</Text>
          <Text style={styles.aka}>Also known as: {med.alsoKnownAs}</Text>
        </View>

        <Text style={styles.oneLiner}>{med.oneLiner}</Text>

        <Section title="What it is" body={med.whatItIs} />
        <Section title="How it helps" body={med.howItHelps} />
        <Section title="What to expect" body={med.whatToExpect} />

        {/* Studies */}
        <View style={styles.studiesSection}>
          <Text style={styles.studiesLabel}>THE SCIENCE</Text>
          <Text style={styles.studiesIntro}>
            You don't have to take our word for it. These are real, peer-reviewed sources.
          </Text>
          {med.studies.map((study, i) => (
            <TouchableOpacity
              key={i}
              style={styles.studyCard}
              onPress={() => Linking.openURL(study.url)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.studyLabel}>{study.label}</Text>
                <Text style={styles.studySource}>{study.source}</Text>
              </View>
              <Text style={styles.studyArrow}>↗</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA to find care */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/find-care')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Find a provider near you</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Education, not medical advice. A licensed provider is the only one who can help you decide what's right for you.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  done: { fontSize: 16, fontWeight: '500', color: Colors.primary },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.lg },
  name: { ...Typography.h1 },
  aka: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
  oneLiner: {
    fontSize: 16,
    color: Colors.primary,
    lineHeight: 23,
    fontWeight: '500',
  },
  section: { gap: 6 },
  sectionTitle: {
    ...Typography.eyebrow,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  sectionBody: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 23,
    letterSpacing: 0.1,
  },
  studiesSection: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  studiesLabel: {
    ...Typography.eyebrow,
    color: Colors.primary,
    letterSpacing: 1.2,
  },
  studiesIntro: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  studyCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  studyLabel: { fontSize: 14, color: Colors.textPrimary, lineHeight: 19 },
  studySource: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  studyArrow: { fontSize: 16, color: Colors.primary },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  ctaText: { ...Typography.label, color: Colors.textInverse },
  disclaimer: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { ...Typography.bodySmall },
});
