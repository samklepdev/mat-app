import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StreakCard } from '../../components/features/StreakCard';
import { CheckInWidget } from '../../components/features/CheckInWidget';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useCheckInStore, useUserStore } from '../../store';
import { getCurrentStreak, upsertCheckIn, getCheckInByDate, hasMilestoneFired, recordMilestoneFired } from '../../db';
import { CheckIn } from '../../types';
import { todayLocalISO as todayISO } from '../../utils/date';
import {
  getMilestoneForStreak,
  fireMilestoneNotification,
  scheduleWeeklySummary,
} from '../../hooks/useNotifications';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning.';
  if (hour < 17) return 'Good afternoon.';
  return 'Good evening.';
}

function mapRowToCheckIn(row: Record<string, unknown>): CheckIn {
  return {
    id: row.id as string,
    date: row.date as string,
    mood: row.mood as number,
    sleep: row.sleep as number,
    cravings: row.cravings as number,
    tookMedication: row.took_medication === 1,
    note: (row.note as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export default function HomeScreen() {
  const { todayCheckIn, setTodayCheckIn } = useCheckInStore();
  const { profile, stability, setStability } = useUserStore();
  const [saving, setSaving] = useState(false);

  // On mount: check SQLite for today's check-in and current streak,
  // since Zustand state resets on every cold app launch.
  useEffect(() => {
    const existing = getCheckInByDate(todayISO());
    if (existing) {
      setTodayCheckIn(mapRowToCheckIn(existing));
    }

    const streak = getCurrentStreak();
    setStability({
      currentStreakDays: streak,
      longestStreakDays: streak, // TODO: track separately once we have history
      totalCheckIns: 0,
      medicationAdherencePercent: 0,
      startDate: profile?.treatmentStartDate ?? todayISO(),
    });
  }, []);

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

    // Refresh streak now that a new check-in exists
    const streak = getCurrentStreak();
    setStability({
      currentStreakDays: streak,
      longestStreakDays: streak,
      totalCheckIns: 0,
      medicationAdherencePercent: 0,
      startDate: profile?.treatmentStartDate ?? todayISO(),
    });

    // Check for milestone and fire notification if not already fired
    const milestone = getMilestoneForStreak(streak);
    if (milestone && !hasMilestoneFired(milestone)) {
      recordMilestoneFired(milestone);
      fireMilestoneNotification(milestone);
    }

    // Schedule weekly summary since user has logged this week
    scheduleWeeklySummary();

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

        {/* Streak — only show once there's something meaningful to display */}
        {stability && profile && (
          stability.currentStreakDays > 0 ? (
            <StreakCard
              streakDays={stability.currentStreakDays}
              treatmentStartDate={profile.treatmentStartDate}
            />
          ) : (
            <View style={styles.firstDayCard}>
              <Text style={styles.firstDayTitle}>Day 1 starts now.</Text>
              <Text style={styles.firstDaySub}>
                Log your medication below to start your record.
              </Text>
            </View>
          )
        )}

        {/* Check-in */}
        <View style={styles.section}>
          {todayCheckIn ? (
            <View style={styles.doneCard}>
              <Text style={styles.doneText}>Logged.</Text>
              <Text style={styles.doneSub}>
                See you tomorrow.
              </Text>
            </View>
          ) : (
            <CheckInWidget onComplete={handleCheckIn} loading={saving} />
          )}
        </View>

        {/* Find care — always accessible, no friction */}
        <TouchableOpacity
          style={styles.findCareLink}
          onPress={() => router.push('/find-care')}
          activeOpacity={0.7}
        >
          <Text style={styles.findCareLinkText}>Need to find a provider? →</Text>
        </TouchableOpacity>
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
  firstDayCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  firstDayTitle: {
    ...Typography.h2,
    fontWeight: '300',
  },
  firstDaySub: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  findCareLink: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  findCareLinkText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
