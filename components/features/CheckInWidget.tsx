import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';

interface CheckInWidgetProps {
  onComplete: (data: {
    mood: number;
    sleep: number;
    cravings: number;
    tookMedication: boolean;
  }) => void;
  loading?: boolean;
}

const SLIDERS = [
  {
    key: 'mood' as const,
    label: 'Mood',
    low: 'Rough',
    high: 'Good',
  },
  {
    key: 'sleep' as const,
    label: 'Sleep',
    low: 'Poor',
    high: 'Restful',
  },
  {
    key: 'cravings' as const,
    label: 'Comfort',
    low: 'Unsettled',
    high: 'Settled',
  },
];

function RatingRow({
  label,
  low,
  high,
  value,
  onChange,
}: {
  label: string;
  low: string;
  high: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.dots}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            onPress={() => onChange(n)}
            style={[styles.dot, value >= n && styles.dotActive]}
            activeOpacity={0.7}
          />
        ))}
      </View>
      <View style={styles.ratingEnds}>
        <Text style={styles.ratingEnd}>{low}</Text>
        <Text style={styles.ratingEnd}>{high}</Text>
      </View>
    </View>
  );
}

export function CheckInWidget({ onComplete, loading }: CheckInWidgetProps) {
  const [mood, setMood] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [cravings, setCravings] = useState(0);
  const [tookMedication, setTookMedication] = useState<boolean | null>(null);

  const isComplete = mood > 0 && sleep > 0 && cravings > 0 && tookMedication !== null;

  const setters = { mood: setMood, sleep: setSleep, cravings: setCravings };

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>How is your body today?</Text>
      <Text style={styles.sub}></Text>

      <View style={styles.sliders}>
        {SLIDERS.map(({ key, label, low, high }) => (
          <RatingRow
            key={key}
            label={label}
            low={low}
            high={high}
            value={key === 'mood' ? mood : key === 'sleep' ? sleep : cravings}
            onChange={setters[key]}
          />
        ))}
      </View>

      <Text style={styles.medLabel}>Medication today?</Text>
      <View style={styles.medRow}>
        {[true, false].map((val) => (
          <TouchableOpacity
            key={String(val)}
            onPress={() => setTookMedication(val)}
            style={[
              styles.medButton,
              tookMedication === val && styles.medButtonActive,
            ]}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.medButtonText,
                tookMedication === val && styles.medButtonTextActive,
              ]}
            >
              {val ? 'Took it' : 'Not yet'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        label="Log it"
        onPress={() => {
          if (!isComplete) return;
          onComplete({ mood, sleep, cravings, tookMedication: tookMedication! });
        }}
        disabled={!isComplete}
        loading={loading}
        style={styles.submit}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
  },
  title: {
    ...Typography.h2,
  },
  sub: {
    ...Typography.bodySmall,
    marginBottom: Spacing.sm,
  },
  sliders: {
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  ratingRow: {
    gap: Spacing.xs,
  },
  ratingLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primaryDim,
    borderColor: Colors.primary,
  },
  ratingEnds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  ratingEnd: {
    ...Typography.label,
    fontSize: 11,
    color: Colors.textMuted,
  },
  medLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  medRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  medButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  medButtonActive: {
    backgroundColor: Colors.primaryDim,
    borderColor: Colors.primary,
  },
  medButtonText: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  medButtonTextActive: {
    color: Colors.primaryLight,
  },
  submit: {
    marginTop: Spacing.md,
  },
});
