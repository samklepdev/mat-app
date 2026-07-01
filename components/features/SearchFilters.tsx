import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../constants/theme';

export interface FilterState {
  buprenorphine: boolean;
  methadone: boolean;
  naltrexone: boolean;
  medicaid: boolean;
  walkIn: boolean;
  telehealth: boolean;
}

export const DEFAULT_FILTERS: FilterState = {
  buprenorphine: false,
  methadone: false,
  naltrexone: false,
  medicaid: false,
  walkIn: false,
  telehealth: false,
};

const FILTER_LABELS: { key: keyof FilterState; label: string }[] = [
  { key: 'buprenorphine', label: 'Buprenorphine' },
  { key: 'methadone', label: 'Methadone' },
  { key: 'naltrexone', label: 'Naltrexone' },
  { key: 'medicaid', label: 'Medicaid' },
  { key: 'walkIn', label: 'Walk-in' },
  { key: 'telehealth', label: 'Telehealth' },
];

interface SearchFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount?: number;
}

export function SearchFilters({ filters, onChange, resultCount }: SearchFiltersProps) {
  const toggle = (key: keyof FilterState) => {
    onChange({ ...filters, [key]: !filters[key] });
  };

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {FILTER_LABELS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.chip, filters[key] && styles.chipActive]}
            onPress={() => toggle(key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, filters[key] && styles.chipTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {activeCount > 0 && resultCount !== undefined && (
        <Text style={styles.resultCount}>
          {resultCount} {resultCount === 1 ? 'result' : 'results'}
        </Text>
      )}
    </View>
  );
}

// ─── Filter logic ─────────────────────────────────────────────────────────────
// Applied client-side against the SAMHSA service descriptions.
// SAMHSA returns a `services` array of human-readable strings per facility.

const SERVICE_KEYWORDS: Record<keyof FilterState, string[]> = {
  buprenorphine: ['buprenorphine', 'suboxone', 'subutex', 'sublocade'],
  methadone: ['methadone'],
  naltrexone: ['naltrexone', 'vivitrol'],
  medicaid: ['medicaid', 'medicare', 'medical assistance', 'state financed'],
  walkIn: ['walk', 'same day', 'walk-in', 'walk in'],
  telehealth: ['telehealth', 'telemedicine', 'online', 'remote', 'virtual'],
};

export function applyFilters<T extends { services: string[] }>(
  facilities: T[],
  filters: FilterState
): T[] {
  const activeFilters = (Object.keys(filters) as (keyof FilterState)[]).filter(
    (k) => filters[k]
  );

  if (activeFilters.length === 0) return facilities;

  return facilities.filter((facility) => {
    const serviceText = facility.services.join(' ').toLowerCase();
    return activeFilters.every((filterKey) =>
      SERVICE_KEYWORDS[filterKey].some((keyword) => serviceText.includes(keyword))
    );
  });
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: 2,
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
    fontWeight: '400',
  },
  chipTextActive: {
    color: Colors.primaryLight,
    fontWeight: '500',
  },
  resultCount: {
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.3,
    paddingHorizontal: 2,
  },
});
