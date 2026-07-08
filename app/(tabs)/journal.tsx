import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import {
  createJournalEntry,
  getRecentJournalEntries,
  getJournalEntryCount,
  deleteJournalEntry,
} from '../../db';
import { JournalEntry } from '../../types';
import { todayLocalISO, parseLocalISO, isSameLocalDay } from '../../utils/date';

const PROMPTS = [
  "What's one thing your body did well today?",
  'What helped you feel more settled this week?',
  'What would you tell yourself from 30 days ago?',
];

function mapRowToEntry(row: Record<string, unknown>): JournalEntry {
  return {
    id: row.id as string,
    date: row.date as string,
    prompt: (row.prompt as string) ?? undefined,
    body: row.body as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function formatEntryDate(iso: string): string {
  const date = parseLocalISO(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameLocalDay(date, today)) return 'Today';
  if (isSameLocalDay(date, yesterday)) return 'Yesterday';

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ─── Past entry card ──────────────────────────────────────────────────────────

function EntryCard({
  entry,
  onDelete,
}: {
  entry: JournalEntry;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = entry.body.length > 140;
  const preview =
    isLong && !expanded ? entry.body.slice(0, 140).trim() + '…' : entry.body;

  const confirmDelete = () => {
    Alert.alert("Delete entry?", "This can't be undone.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(entry.id) },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => isLong && setExpanded((v) => !v)}
      onLongPress={confirmDelete}
      activeOpacity={isLong ? 0.7 : 1}
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{formatEntryDate(entry.date)}</Text>
        <TouchableOpacity
          onPress={confirmDelete}
          hitSlop={10}
          style={styles.entryDeleteBtn}
        >
          <Text style={styles.entryDeleteText}>✕</Text>
        </TouchableOpacity>
      </View>
      {entry.prompt && <Text style={styles.entryPrompt}>{entry.prompt}</Text>}
      <Text style={styles.entryBody}>{preview}</Text>
    </TouchableOpacity>
  );
}

// ─── Main screen — reading space ───────────────────────────────────────────────

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const PAGE_SIZE = 20;

  const loadEntries = useCallback((reset = true) => {
    const offset = reset ? 0 : page * PAGE_SIZE;
    const rows = getRecentJournalEntries(PAGE_SIZE, reset ? 0 : offset);
    const total = getJournalEntryCount();

    if (reset) {
      setEntries(rows.map(mapRowToEntry));
      setPage(1);
      setHasMore(total > PAGE_SIZE);
    } else {
      setEntries((prev) => [...prev, ...rows.map(mapRowToEntry)]);
      setPage((p) => p + 1);
      setHasMore(offset + rows.length < total);
    }
  }, [page]);

  useFocusEffect(
    useCallback(() => {
      loadEntries(true);
    }, [])
  );

  const handleDelete = (id: string) => {
    deleteJournalEntry(id);
    loadEntries(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View>
          <Text style={styles.title}>Journal</Text>
          <Text style={styles.sub}>Your record. No one else's.</Text>
        </View>

        {/* New entry button */}
        <TouchableOpacity
          style={styles.newEntryButton}
          onPress={() => router.push('/journal-write')}
          activeOpacity={0.8}
        >
          <Text style={styles.newEntryButtonText}>＋  New entry</Text>
        </TouchableOpacity>

        {/* Entries */}
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Nothing here yet. Whenever you're ready.
            </Text>
          </View>
        ) : (
          <View style={styles.entryList}>
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
            ))}
            {hasMore && (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={() => loadEntries(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.loadMoreText}>Load more</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.lg },
  title: { ...Typography.h1, marginBottom: 4 },
  sub: { ...Typography.bodySmall },

  newEntryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  newEntryButtonText: {
    ...Typography.label,
    color: Colors.textInverse,
  },

  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  entryList: { gap: Spacing.sm },
  loadMoreBtn: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  loadMoreText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  entryCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 4,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDeleteBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryDeleteText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  entryDate: {
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  entryPrompt: {
    fontSize: 12,
    color: Colors.primary,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  entryBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
  },

});
