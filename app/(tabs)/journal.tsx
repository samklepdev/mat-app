import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import {
  createJournalEntry,
  getRecentJournalEntries,
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

// ─── Write entry modal ────────────────────────────────────────────────────────

function WriteEntryModal({
  visible,
  onClose,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [selectedPrompt, setSelectedPrompt] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [customTopicFocused, setCustomTopicFocused] = useState(false);

  const handlePromptSelect = (index: number) => {
    setSelectedPrompt(index);
    setCustomTopic('');
    setText(PROMPTS[index] + '\n\n');
  };

  const handleCustomTopicChange = (value: string) => {
    setCustomTopic(value);
    setSelectedPrompt(null); // custom topic and preset prompts are mutually exclusive
  };

  const reset = () => {
    setText('');
    setSelectedPrompt(null);
    setCustomTopic('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    if (!text.trim()) return;

    const now = new Date().toISOString();
    const today = todayLocalISO();

    const resolvedPrompt =
      selectedPrompt !== null
        ? PROMPTS[selectedPrompt]
        : customTopic.trim() || undefined;

    createJournalEntry({
      id: `journal-${Date.now()}`,
      date: today,
      prompt: resolvedPrompt,
      body: text.trim(),
      createdAt: now,
      updatedAt: now,
    });

    reset();
    onSaved();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.modalSafe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleClose} hitSlop={12}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!text.trim()}
              hitSlop={12}
            >
              <Text style={[styles.modalDone, !text.trim() && styles.modalDoneDim]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.modalTitle}>New entry</Text>

            {/* Prompts */}
            <View style={styles.promptList}>
              {PROMPTS.map((p, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handlePromptSelect(i)}
                  style={[
                    styles.promptCard,
                    selectedPrompt === i && styles.promptCardActive,
                  ]}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.promptText,
                      selectedPrompt === i && styles.promptTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Custom topic — same card styling, but editable */}
              <View
                style={[
                  styles.promptCard,
                  (customTopicFocused || customTopic.length > 0) &&
                    styles.promptCardActive,
                ]}
              >
                <TextInput
                  value={customTopic}
                  onChangeText={handleCustomTopicChange}
                  onFocus={() => setCustomTopicFocused(true)}
                  onBlur={() => setCustomTopicFocused(false)}
                  placeholder="Or write your own topic…"
                  placeholderTextColor={Colors.textMuted}
                  style={[
                    styles.promptText,
                    styles.customTopicInput,
                    (customTopicFocused || customTopic.length > 0) &&
                      styles.promptTextActive,
                  ]}
                />
              </View>
            </View>

            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Whatever's on your mind."
              placeholderTextColor={Colors.textMuted}
              style={styles.textArea}
              multiline
              textAlignVertical="top"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main screen — reading space ───────────────────────────────────────────────

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [writeModalVisible, setWriteModalVisible] = useState(false);

  const loadEntries = useCallback(() => {
    const rows = getRecentJournalEntries(50);
    setEntries(rows.map(mapRowToEntry));
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleDelete = (id: string) => {
    deleteJournalEntry(id);
    loadEntries();
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
          onPress={() => setWriteModalVisible(true)}
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
          </View>
        )}
      </ScrollView>

      <WriteEntryModal
        visible={writeModalVisible}
        onClose={() => setWriteModalVisible(false)}
        onSaved={loadEntries}
      />
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

  // Modal
  modalSafe: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  modalCancel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  modalDoneDim: {
    color: Colors.textMuted,
  },
  modalContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h2,
  },
  promptList: { gap: Spacing.sm },
  promptCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  promptCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDim,
  },
  promptText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  promptTextActive: {
    color: Colors.textPrimary,
  },
  customTopicInput: {
    padding: 0,
    margin: 0,
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    minHeight: 220,
    letterSpacing: 0.1,
  },
});
