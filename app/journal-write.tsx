import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { createJournalEntry } from '../db';
import { todayLocalISO } from '../utils/date';

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function JournalWriteScreen() {
  const [text, setText] = useState('');

  const handleSave = () => {
    if (!text.trim()) return;
    const now = new Date().toISOString();
    createJournalEntry({
      id: `journal-${Date.now()}`,
      date: todayLocalISO(),
      prompt: undefined,
      body: text.trim(),
      createdAt: now,
      updatedAt: now,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} disabled={!text.trim()} hitSlop={12}>
            <Text style={[styles.done, !text.trim() && styles.doneDim]}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={styles.date}>{todayLabel()}</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="However you're feeling. No prompts, no rules — just say it."
            placeholderTextColor={Colors.textMuted}
            style={styles.textArea}
            multiline
            textAlignVertical="top"
            autoFocus
          />
        </View>
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
  body: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  date: {
    ...Typography.eyebrow,
    color: Colors.textMuted,
  },
  textArea: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    lineHeight: 25,
    letterSpacing: 0.1,
  },
});
