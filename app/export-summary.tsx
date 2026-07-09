import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { getCheckInStats, getCurrentStreak } from '../db';
import { useUserStore } from '../store';
import { parseLocalISO } from '../utils/date';

type RangeDays = 30 | 90;

const MEDICATION_LABELS: Record<string, string> = {
  buprenorphine: 'Buprenorphine',
  suboxone: 'Suboxone (buprenorphine/naloxone)',
  sublocade: 'Sublocade (buprenorphine XR injection)',
  methadone: 'Methadone',
  naltrexone: 'Naltrexone',
  vivitrol: 'Vivitrol (naltrexone XR injection)',
  other: 'MAT medication',
};

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function buildSummaryHtml(params: {
  displayName?: string;
  treatmentStartDate: string;
  rangeDays: RangeDays;
  stats: ReturnType<typeof getCheckInStats>;
  streak: number;
}): string {
  const { displayName, treatmentStartDate, rangeDays, stats, streak } = params;

  const checkInCount = stats.length;
  const medDays = stats.filter((s) => s.took_medication === 1).length;
  const adherencePct = checkInCount ? Math.round((medDays / checkInCount) * 100) : 0;
  const moodAvg = avg(stats.map((s) => s.mood)).toFixed(1);
  const sleepAvg = avg(stats.map((s) => s.sleep)).toFixed(1);
  const comfortAvg = avg(stats.map((s) => s.cravings)).toFixed(1);

  // Simple week-by-week table
  const weeks: { label: string; mood: string; sleep: string; comfort: string; meds: string }[] = [];
  for (let w = 0; w * 7 < stats.length; w++) {
    const slice = stats.slice(w * 7, w * 7 + 7);
    if (!slice.length) break;
    weeks.push({
      label: `${slice[0].date} – ${slice[slice.length - 1].date}`,
      mood: avg(slice.map((s) => s.mood)).toFixed(1),
      sleep: avg(slice.map((s) => s.sleep)).toFixed(1),
      comfort: avg(slice.map((s) => s.cravings)).toFixed(1),
      meds: `${slice.filter((s) => s.took_medication === 1).length}/${slice.length}`,
    });
  }

  const startDateFormatted = parseLocalISO(treatmentStartDate).toLocaleDateString(undefined, {
    month: 'long', day: 'numeric', year: 'numeric',
  });
  const today = new Date().toLocaleDateString(undefined, {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, Helvetica, sans-serif; color: #1a1a2e; padding: 32px; font-size: 13px; line-height: 1.5; }
  h1 { font-size: 22px; margin: 0 0 4px; font-weight: 600; }
  .subtitle { color: #3D8FA6; font-style: italic; margin-bottom: 20px; }
  .meta { color: #555; margin-bottom: 24px; }
  .meta div { margin-bottom: 2px; }
  h2 { font-size: 15px; color: #3D8FA6; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin: 24px 0 10px; }
  .stats { display: flex; gap: 24px; margin-bottom: 8px; }
  .stat { text-align: center; }
  .stat .num { font-size: 26px; font-weight: 300; }
  .stat .label { font-size: 10px; color: #777; text-transform: uppercase; letter-spacing: 1px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #777; padding: 6px 8px; border-bottom: 1px solid #ddd; }
  td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 12px; }
  .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #ddd; color: #999; font-size: 10px; font-style: italic; }
  .scale-note { color: #999; font-size: 10px; margin-top: 4px; }
</style></head>
<body>
  <h1>Treatment Summary${displayName ? ` — ${displayName}` : ''}</h1>
  <div class="subtitle">Patient-generated report from daily self-tracking</div>

  <div class="meta">
    <div><b>Report date:</b> ${today}</div>
    <div><b>Period covered:</b> last ${rangeDays} days</div>
    <div><b>Treatment start:</b> ${startDateFormatted}</div>
    <div><b>Current consecutive days logged with medication:</b> ${streak}</div>
  </div>

  <h2>Overview</h2>
  <div class="stats">
    <div class="stat"><div class="num">${checkInCount}</div><div class="label">Check-ins</div></div>
    <div class="stat"><div class="num">${adherencePct}%</div><div class="label">Medication logged</div></div>
    <div class="stat"><div class="num">${moodAvg}</div><div class="label">Avg mood</div></div>
    <div class="stat"><div class="num">${sleepAvg}</div><div class="label">Avg sleep</div></div>
    <div class="stat"><div class="num">${comfortAvg}</div><div class="label">Avg comfort</div></div>
  </div>
  <div class="scale-note">Mood, sleep, and comfort self-rated daily on a 1–5 scale (5 = best). "Comfort" reflects absence of cravings/unsettledness.</div>

  <h2>Week by week</h2>
  <table>
    <tr><th>Week</th><th>Mood</th><th>Sleep</th><th>Comfort</th><th>Medication days</th></tr>
    ${weeks.map((w) => `<tr><td>${w.label}</td><td>${w.mood}</td><td>${w.sleep}</td><td>${w.comfort}</td><td>${w.meds}</td></tr>`).join('')}
  </table>

  <div class="footer">
    Generated by the patient from their own self-tracked data. All data is stored locally on the patient's device and shared at their sole discretion. Self-reported; not a clinical instrument.
  </div>
</body>
</html>`;
}

export default function ExportSummaryScreen() {
  const { profile } = useUserStore();
  const [range, setRange] = useState<RangeDays>(30);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!profile) return;
    setGenerating(true);
    setError(null);

    try {
      const stats = getCheckInStats(range);
      const streak = getCurrentStreak();

      const html = buildSummaryHtml({
        displayName: profile.displayName,
        treatmentStartDate: profile.treatmentStartDate,
        rangeDays: range,
        stats,
        streak,
      });

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share treatment summary',
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (e) {
      setError("Couldn't generate the summary. Try again.");
    } finally {
      setGenerating(false);
    }
  };

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
          <Text style={styles.title}>Bring to your appointment</Text>
          <Text style={styles.sub}>
            A clean PDF summary of your check-ins, medication consistency, and trends — generated from your own data, shared only when you choose.
          </Text>
        </View>

        {/* Range selector */}
        <View style={styles.rangeSection}>
          <Text style={styles.sectionLabel}>PERIOD</Text>
          <View style={styles.rangeRow}>
            {([30, 90] as RangeDays[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.rangeChip, range === r && styles.rangeChipActive]}
                onPress={() => setRange(r)}
                activeOpacity={0.75}
              >
                <Text style={[styles.rangeText, range === r && styles.rangeTextActive]}>
                  Last {r} days
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* What's included */}
        <View style={styles.includedCard}>
          <Text style={styles.includedTitle}>What's in the report</Text>
          <Text style={styles.includedItem}>• Check-in count and medication consistency</Text>
          <Text style={styles.includedItem}>• Average mood, sleep, and comfort scores</Text>
          <Text style={styles.includedItem}>• Week-by-week breakdown</Text>
          <Text style={styles.includedItem}>• Treatment start date and current streak</Text>
          <Text style={styles.includedNote}>
            Journal entries are never included. Your words stay yours.
          </Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={styles.exportBtn}
          onPress={handleExport}
          disabled={generating}
          activeOpacity={0.8}
        >
          {generating ? (
            <ActivityIndicator color={Colors.textInverse} />
          ) : (
            <Text style={styles.exportBtnText}>Generate PDF</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          Opens the share sheet — send it to yourself, print it, or AirDrop it at the front desk.
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

  rangeSection: { gap: Spacing.sm },
  sectionLabel: { ...Typography.eyebrow, color: Colors.textMuted, letterSpacing: 1.2 },
  rangeRow: { flexDirection: 'row', gap: Spacing.sm },
  rangeChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  rangeChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryDim },
  rangeText: { fontSize: 14, color: Colors.textSecondary },
  rangeTextActive: { color: Colors.primaryLight, fontWeight: '500' },

  includedCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 6,
  },
  includedTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  includedItem: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  includedNote: { fontSize: 12, color: Colors.primary, fontStyle: 'italic', marginTop: 4 },

  error: { fontSize: 13, color: Colors.error, textAlign: 'center' },

  exportBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
  },
  exportBtnText: { ...Typography.label, color: Colors.textInverse },
  hint: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', lineHeight: 17 },
});
