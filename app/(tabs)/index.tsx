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
import { getMilestoneForDay } from '../../content/healingTimeline';
import { getTodaysReflection } from '../../content/reflections';
import { generateInsights, Insight } from '../../utils/insights';
import { getCheckInStats } from '../../db';
import { parseLocalISO } from '../../utils/date';

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
  const [insights, setInsights] = useState<Insight[]>([]);

  const treatmentDay = profile
    ? Math.max(1, Math.floor((Date.now() - parseLocalISO(profile.treatmentStartDate).getTime()) / 86400000) + 1)
    : 1;
  const healingMilestone = getMilestoneForDay(treatmentDay);
  const reflection = getTodaysReflection();

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

    // Generate insights from check-in history
    const stats = getCheckInStats(90);
    setInsights(generateInsights(stats));
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

        {/* Healing timeline — today's milestone */}
        {healingMilestone && (
          <View style={styles.healingCard}>
            <Text style={styles.healingEyebrow}>DAY {treatmentDay} · YOUR BODY</Text>
            <Text style={styles.healingTitle}>{healingMilestone.title}</Text>
            <Text style={styles.healingBody}>{healingMilestone.body}</Text>
          </View>
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

        {/* Insights from your own data */}
        {insights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.insightsLabel}>NOTICING</Text>
            {insights.map((insight) => (
              <View key={insight.id} style={styles.insightCard}>
                <Text style={styles.insightText}>{insight.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Daily reflection */}
        <View style={styles.reflectionCard}>
          <Text style={styles.reflectionEyebrow}>TODAY'S REFLECTION</Text>
          <Text style={styles.reflectionText}>{reflection.text}</Text>
        </View>

        {/* Wins link */}
        <TouchableOpacity
          style={styles.winsLink}
          onPress={() => router.push('/wins')}
          activeOpacity={0.75}
        >
          <Text style={styles.winsLinkText}>Life rebuilt — wins & money saved →</Text>
        </TouchableOpacity>

        {/* Quick links — always accessible */}
        <View style={styles.quickLinks}>
          <TouchableOpacity onPress={() => router.push('/find-care')} activeOpacity={0.7}>
            <Text style={styles.quickLinkText}>Find a provider →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/learn')} activeOpacity={0.7}>
            <Text style={styles.quickLinkText}>Learn about MAT →</Text>
          </TouchableOpacity>
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
  healingCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primaryDim,
    borderRadius: 16,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  healingEyebrow: {
    ...Typography.eyebrow,
    fontSize: 10,
  },
  healingTitle: {
    ...Typography.h3,
    fontWeight: '500',
  },
  healingBody: {
    ...Typography.bodySmall,
    lineHeight: 20,
  },
  insightsLabel: {
    ...Typography.eyebrow,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  insightCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
  },
  insightText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  reflectionCard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  reflectionEyebrow: {
    ...Typography.eyebrow,
    fontSize: 10,
    color: Colors.textMuted,
  },
  reflectionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  winsLink: {
    paddingVertical: Spacing.xs,
  },
  winsLinkText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  quickLinks: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  quickLinkText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
