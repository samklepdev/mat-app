import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { StreakCard } from '../../components/features/StreakCard';
import { CheckInWidget } from '../../components/features/CheckInWidget';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useCheckInStore, useUserStore } from '../../store';
import { getCurrentStreak, upsertCheckIn } from '../../db';
import { CheckIn } from '../../types';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning.';
  if (hour < 17) return 'Good afternoon.';
  return 'Good evening.';
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default function HomeScreen() {
  const { todayCheckIn, setTodayCheckIn } = useCheckInStore();
  const { profile, stability, setStability } = useUserStore();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const streak = getCurrentStreak();
    if (stability) {
      setStability({ ...stability, currentStreakDays: streak });
    }
  }, [todayCheckIn]);

  const handleCheckIn = async (data: {
    mood: number;
    sleep: number;
    cravings: number;
    tookMedication: boolean;
  }) => {
    setSaving(true);
    const now = new Date().toISOString();
    const checkIn: CheckIn = {
      id: `checkin-${todayISO()}`,
      date: todayISO(),
      ...data,
      createdAt: now,
    };

    upsertCheckIn({
      ...checkIn,
      tookMedication: checkIn.tookMedication,
    });

    setTodayCheckIn(checkIn);
    setSaving(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting()}</Text>
          {profile?.displayName && (
            <Text style={styles.name}>{profile.displayName}</Text>
          )}
        </View>

        {/* Streak */}
        {stability && profile && (
          <StreakCard
            streakDays={stability.currentStreakDays}
            treatmentStartDate={profile.treatmentStartDate}
          />
        )}

        {/* Check-in */}
        <View style={styles.section}>
          {todayCheckIn ? (
            <View style={styles.doneCard}>
              <Text style={styles.doneText}>✓ Check-in complete for today</Text>
              <Text style={styles.doneSub}>
                Come back tomorrow. You're doing the work.
              </Text>
            </View>
          ) : (
            <CheckInWidget onComplete={handleCheckIn} loading={saving} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  greeting: {
    ...Typography.h1,
    fontWeight: '300',
  },
  name: {
    ...Typography.h1,
    color: Colors.primary,
  },
  section: {
    gap: Spacing.md,
  },
  doneCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primaryDim,
    gap: Spacing.xs,
  },
  doneText: {
    ...Typography.h3,
    color: Colors.primary,
  },
  doneSub: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
});
