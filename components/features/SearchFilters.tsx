import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../constants/theme';

export type RadiusMiles = 10 | 25 | 50;

export interface FilterState {
  radiusMiles: RadiusMiles;
}

export const DEFAULT_FILTERS: FilterState = {
  radiusMiles: 25,
};

const RADIUS_OPTIONS: { value: RadiusMiles; label: string }[] = [
  { value: 10, label: '10 mi' },
  { value: 25, label: '25 mi' },
  { value: 50, label: '50 mi' },
];

interface SearchFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount?: number;
  onRadiusChange: (radius: RadiusMiles) => void;
}

export function SearchFilters({
  filters,
  onChange,
  resultCount,
  onRadiusChange,
}: SearchFiltersProps) {
  const handleRadius = (value: RadiusMiles) => {
    onChange({ ...filters, radiusMiles: value });
    onRadiusChange(value);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={styles.label}>Distance</Text>
        <View style={styles.chips}>
          {RADIUS_OPTIONS.map(({ value, label }) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.chip,
                filters.radiusMiles === value && styles.chipActive,
              ]}
              onPress={() => handleRadius(value)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.chipText,
                  filters.radiusMiles === value && styles.chipTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {resultCount !== undefined && (
        <Text style={styles.resultCount}>
          {resultCount} {resultCount === 1 ? 'result' : 'results'} within {filters.radiusMiles} miles
        </Text>
      )}
    </View>
  );
}

export function applyFilters<T>(facilities: T[], _filters: FilterState): T[] {
  return facilities; // radius filtering happens at search time via API
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDim,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primaryLight,
    fontWeight: '500',
  },
  resultCount: {
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
});
