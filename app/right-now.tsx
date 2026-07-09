import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { BreathingExercise } from '../components/features/BreathingExercise';
import { getSavedProviders } from '../db';
import { useUserStore } from '../store';

export default function RightNowScreen() {
  const { profile } = useUserStore();
  const [showBreathing, setShowBreathing] = useState(false);
  const savedCount = getSavedProviders().length;

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };
  const whyNote = (profile as any)?.whyNote as string | undefined;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} hitSlop={12}>
          <Text style={styles.close}>Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {showBreathing ? (
          <View style={styles.breathingContainer}>
            <BreathingExercise />
            <TouchableOpacity onPress={() => setShowBreathing(false)} style={styles.backToOptions}>
              <Text style={styles.backToOptionsText}>← Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.intro}>
              <Text style={styles.title}>This will pass.</Text>
              <Text style={styles.sub}>
                A craving is a wave, not a command. It peaks and it fades — usually in about 20 minutes. You've outlasted every one so far. Let's get through this one.
              </Text>
            </View>

            {/* Breathing */}
            <TouchableOpacity
              style={styles.primaryCard}
              onPress={() => setShowBreathing(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryCardTitle}>Breathe with me</Text>
              <Text style={styles.primaryCardSub}>
                A slow, guided breath to steady your body. Start here.
              </Text>
            </TouchableOpacity>

            {/* Your why */}
            {whyNote ? (
              <View style={styles.whyCard}>
                <Text style={styles.whyLabel}>WHY YOU'RE DOING THIS</Text>
                <Text style={styles.whyText}>{whyNote}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.whySetup}
                onPress={() => router.push('/settings')}
                activeOpacity={0.8}
              >
                <Text style={styles.whySetupText}>
                  Write a note to yourself for hard moments — set it up in Settings so it's here next time.
                </Text>
              </TouchableOpacity>
            )}

            {/* Call helpline */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => Linking.openURL('tel:1-800-662-4357')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionTitle}>Talk to someone now</Text>
              <Text style={styles.actionSub}>SAMHSA Helpline — free, confidential, 24/7</Text>
            </TouchableOpacity>

            {/* 988 */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => Linking.openURL('tel:988')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionTitle}>988 — Crisis & Suicide Lifeline</Text>
              <Text style={styles.actionSub}>If you're in danger or thinking about ending things</Text>
            </TouchableOpacity>

            {/* Saved providers */}
            {savedCount > 0 && (
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push('/saved-providers')}
                activeOpacity={0.8}
              >
                <Text style={styles.actionTitle}>Your saved providers</Text>
                <Text style={styles.actionSub}>Reach out to someone you already trust</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.footer}>
              You opened this app instead of using. That's the whole fight, right there.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  close: { fontSize: 16, color: Colors.textSecondary },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.md },

  breathingContainer: {
    alignItems: 'center',
    gap: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  backToOptions: { paddingVertical: Spacing.md },
  backToOptionsText: { fontSize: 15, color: Colors.textSecondary },

  intro: { gap: Spacing.sm, marginBottom: Spacing.xs },
  title: { ...Typography.h1, fontWeight: '300' },
  sub: { ...Typography.body, color: Colors.textSecondary, lineHeight: 24 },

  primaryCard: {
    backgroundColor: Colors.primaryDim,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: 6,
  },
  primaryCardTitle: { fontSize: 20, fontWeight: '500', color: Colors.textPrimary },
  primaryCardSub: { ...Typography.bodySmall, lineHeight: 20 },

  whyCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: 8,
  },
  whyLabel: { ...Typography.eyebrow, color: Colors.primary, letterSpacing: 1.2 },
  whyText: { fontSize: 16, color: Colors.textPrimary, lineHeight: 24, fontStyle: 'italic' },

  whySetup: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  whySetupText: { ...Typography.bodySmall, color: Colors.textMuted, lineHeight: 19 },

  actionCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 3,
  },
  actionTitle: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  actionSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },

  footer: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: Spacing.md,
  },
});
