import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { createJournalEntry } from '../db';
import { todayLocalISO } from '../utils/date';

const PROMPTS = [
  "What's one thing your body did well today?",
  'What helped you feel more settled this week?',
  'What would you tell yourself from 30 days ago?',
];

export default function JournalWriteScreen() {
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
    setSelectedPrompt(null);
  };

  const handleSave = () => {
    if (!text.trim()) return;

    const now = new Date().toISOString();
    const resolvedPrompt =
      selectedPrompt !== null
        ? PROMPTS[selectedPrompt]
        : customTopic.trim() || undefined;

    createJournalEntry({
      id: `journal-${Date.now()}`,
      date: todayLocalISO(),
      prompt: resolvedPrompt,
      body: text.trim(),
      createdAt: now,
      updatedAt: now,
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} disabled={!text.trim()} hitSlop={12}>
            <Text style={[styles.done, !text.trim() && styles.doneDim]}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>New entry</Text>

          {/* Prompts */}
          <View style={styles.promptList}>
            {PROMPTS.map((p, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handlePromptSelect(i)}
                style={[styles.promptCard, selectedPrompt === i && styles.promptCardActive]}
                activeOpacity={0.75}
              >
                <Text style={[styles.promptText, selectedPrompt === i && styles.promptTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Custom topic */}
            <View
              style={[
                styles.promptCard,
                (customTopicFocused || customTopic.length > 0) && styles.promptCardActive,
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
                  (customTopicFocused || customTopic.length > 0) && styles.promptTextActive,
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
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  cancel: { fontSize: 16, color: Colors.textSecondary },
  done: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  doneDim: { color: Colors.textMuted },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  title: { ...Typography.h2 },
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
  promptTextActive: { color: Colors.textPrimary },
  customTopicInput: { padding: 0, margin: 0 },
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
