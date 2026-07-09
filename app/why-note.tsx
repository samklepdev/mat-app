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
import { Colors, Spacing, Typography } from '../constants/theme';
import { updateWhyNote } from '../db';
import { useUserStore } from '../store';

export default function WhyNoteScreen() {
  const { profile, setProfile } = useUserStore();
  const [text, setText] = useState((profile as any)?.whyNote ?? '');

  const handleSave = () => {
    updateWhyNote(text.trim());
    if (profile) setProfile({ ...(profile as any), whyNote: text.trim() });
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
          <TouchableOpacity onPress={handleSave} hitSlop={12}>
            <Text style={styles.done}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>Your why</Text>
          <Text style={styles.sub}>
            Write something to yourself for the hard moments — the reason you started, who you're doing this for, what you'd lose. It'll be waiting for you when you tap "Having a hard moment."
          </Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="On a hard day, remember…"
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
  body: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
  title: { ...Typography.h1 },
  sub: { ...Typography.bodySmall, lineHeight: 20 },
  textArea: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    lineHeight: 25,
    letterSpacing: 0.1,
    marginTop: Spacing.sm,
  },
});
