import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface StreakCardProps {
  streakDays: number;
  treatmentStartDate: string;
}

export function StreakCard({ streakDays, treatmentStartDate }: StreakCardProps) {
  const startDate = new Date(treatmentStartDate);
  const totalDays = Math.floor(
    (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const streakLabel = 'days of consistent treatment.';

  return (
    <Card raised style={styles.card}>
      <Text style={styles.eyebrow}>SHOWING UP</Text>
      <View style={styles.row}>
        <Text style={styles.number}>{streakDays}</Text>
        <Text style={styles.unit}>{streakLabel}</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.sub}>
        You're doing the work. This is your record of it.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  eyebrow: {
    ...Typography.eyebrow,
    textTransform: 'uppercase' as const,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  number: {
    ...Typography.display,
  },
  unit: {
    ...Typography.h2,
    color: Colors.textSecondary,
    fontWeight: '300',
    marginBottom: 10, // baseline align with the large number
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  sub: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
});
