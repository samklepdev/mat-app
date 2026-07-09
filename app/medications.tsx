import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { MEDICATIONS } from '../content/medications';

export default function MedicationsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.title}>The medicines</Text>
          <Text style={styles.sub}>
            If you're just starting to look for a way out, start here. Plain answers about the medications that treat opioid addiction — and the science behind them.
          </Text>
        </View>

        <View style={styles.list}>
          {MEDICATIONS.map((med) => (
            <TouchableOpacity
              key={med.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/medication-detail', params: { id: med.id } })}
              activeOpacity={0.75}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>{med.name}</Text>
                <Text style={styles.cardAka}>{med.alsoKnownAs}</Text>
                <Text style={styles.cardOneLiner}>{med.oneLiner}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          This is education, not medical advice. Only a licensed provider can help you choose the right medication for you. If you're ready, the Find Care screen can help you reach one.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  backRow: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xs, paddingBottom: Spacing.xs },
  backButton: { fontSize: 16, color: Colors.primary },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.lg },
  title: { ...Typography.h1, marginBottom: 4 },
  sub: { ...Typography.bodySmall, lineHeight: 20 },
  list: { gap: Spacing.sm },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardContent: { flex: 1, gap: 3 },
  cardName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  cardAka: { fontSize: 12, color: Colors.textMuted },
  cardOneLiner: { fontSize: 13, color: Colors.primary, marginTop: 2, lineHeight: 18 },
  chevron: { fontSize: 22, color: Colors.textMuted },
  disclaimer: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
