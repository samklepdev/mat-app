import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { router } from 'expo-router';
import { useUserStore } from '../../store';
import { upsertProfile, deleteAllData } from '../../db';
import { parseLocalISO, toLocalISO, formatTimeHHMM } from '../../utils/date';
import {
  requestNotificationPermissions,
  scheduleMedicationReminder,
  cancelMedicationReminder,
  scheduleMissedCheckInNudge,
  cancelMissedCheckInNudge,
  cancelSupportiveNudge,
  scheduleReflectionNotification,
  cancelReflectionNotification,
} from '../../hooks/useNotifications';
import { ReminderTimesEditor } from '../../components/features/ReminderTimesEditor';

const MEDICATION_LABELS: Record<string, string> = {
  buprenorphine: 'Buprenorphine',
  suboxone: 'Suboxone',
  sublocade: 'Sublocade',
  methadone: 'Methadone',
  naltrexone: 'Naltrexone',
  vivitrol: 'Vivitrol',
  other: 'Other MAT medication',
};

function formatDate(iso: string): string {
  return parseLocalISO(iso).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Reusable row ─────────────────────────────────────────────────────────────

function SettingRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {onPress && <Text style={styles.chevron}>›</Text>}
      </View>
    </TouchableOpacity>
  );
}

// ─── Reminder time editor modal ───────────────────────────────────────────────

function ReminderModal({
  visible,
  initialTimes,
  initialNote,
  onClose,
  onSave,
}: {
  visible: boolean;
  initialTimes: string[];
  initialNote?: string;
  onClose: () => void;
  onSave: (times: string[], note: string) => void;
}) {
  const [times, setTimes] = useState<string[]>(initialTimes);
  const [note, setNote] = useState(initialNote ?? '');

  const handleSave = () => {
    onSave(times, note);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Daily reminder</Text>

          <ReminderTimesEditor times={times} onChange={setTimes} />

          <Text style={styles.modalLabel}>Note (optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="e.g. leave for clinic"
            placeholderTextColor={Colors.textMuted}
            style={styles.modalInput}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose} style={styles.modalCancelBtn}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.modalSaveBtn}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Start date reset modal ────────────────────────────────────────────────────

function StartDateModal({
  visible,
  initialDate,
  onClose,
  onSave,
}: {
  visible: boolean;
  initialDate: string;
  onClose: () => void;
  onSave: (date: Date) => void;
}) {
  const [date, setDate] = useState<Date>(() => parseLocalISO(initialDate));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Reset your start date</Text>
          <Text style={styles.modalLabel}>
            This updates your day count, healing timeline, and money-saved total.
            Your check-ins, journal entries, and wins are kept exactly as they are.
          </Text>

          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            onChange={(_, d) => d && setDate(d)}
            themeVariant="dark"
            style={{ height: 150, marginLeft: -10 }}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose} style={styles.modalCancelBtn}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSave(date)} style={styles.modalSaveBtn}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── About modal ──────────────────────────────────────────────────────────────

function AboutModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>About this app</Text>
          <ScrollView style={{ maxHeight: 320 }}>
            <Text style={styles.aboutParagraph}>
              This app treats medication-assisted treatment as complete, legitimate
              recovery. Not a tool to manage a problem — a record of you showing up.
            </Text>
            <Text style={styles.aboutParagraph}>
              Everything you enter — check-ins, journal entries, your medication
              info — stays on this device. Nothing is sent anywhere, sold, or
              shared. There are no analytics, no trackers, no third parties.
            </Text>
            <Text style={styles.aboutParagraph}>
              No account is required to use this app. If you delete it, your
              data is gone — there's no cloud backup unless you choose to add
              one in the future.
            </Text>
            <Text style={styles.aboutParagraph}>
              Built by someone who takes MAT medication too.
            </Text>
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={styles.aboutCloseBtn}>
            <Text style={styles.modalSaveText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { profile, setProfile } = useUserStore();
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [startDateModalVisible, setStartDateModalVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    profile?.notificationsEnabled ?? false
  );
  const [privacyLock, setPrivacyLock] = useState(
    profile?.biometricLockEnabled ?? false
  );

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.title}>Settings</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete all data?',
      'This will permanently erase your check-ins, journal entries, saved providers, and profile. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            await cancelMedicationReminder();
            await cancelMissedCheckInNudge();
            await cancelSupportiveNudge();
            await cancelReflectionNotification();
            deleteAllData();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const persistProfile = (updates: Partial<typeof profile>) => {
    const updated = { ...profile, ...updates };
    upsertProfile({
      id: updated.id,
      displayName: updated.displayName,
      treatmentStartDate: updated.treatmentStartDate,
      notificationsEnabled: updated.notificationsEnabled,
      biometricLockEnabled: updated.biometricLockEnabled,
      reminderTimes: updated.reminderTimes,
      reminderNote: updated.reminderNote,
      createdAt: updated.createdAt,
    });
    setProfile(updated);
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleMedicationReminder(profile.reminderTimes, profile.reminderNote);
        await scheduleMissedCheckInNudge();
        await scheduleReflectionNotification();
      }
    } else {
      await cancelMedicationReminder();
      await cancelMissedCheckInNudge();
      await cancelSupportiveNudge();
      await cancelReflectionNotification();
    }
    persistProfile({ notificationsEnabled: value });
  };

  const handleReminderSave = async (times: string[], note: string) => {
    setReminderModalVisible(false);
    persistProfile({ reminderTimes: times, reminderNote: note.trim() || undefined });
    if (notificationsEnabled) {
      await scheduleMedicationReminder(times, note.trim() || undefined);
    }
  };

  const handleStartDateSave = (date: Date) => {
    setStartDateModalVisible(false);
    persistProfile({ treatmentStartDate: toLocalISO(date) });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.sub}>Make it work for you.</Text>
        </View>

        {/* Medication */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR MEDICATION</Text>
          <View style={styles.card}>
            <SettingRow
              label="Your start date"
              value={formatDate(profile.treatmentStartDate)}
              onPress={() => setStartDateModalVisible(true)}
            />
          </View>
        </View>

        {/* Reminder */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DAILY REMINDER</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Reminders</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: Colors.border, true: Colors.primaryDim }}
                thumbColor={notificationsEnabled ? Colors.primary : Colors.textMuted}
              />
            </View>
            {notificationsEnabled && (
              <SettingRow
                label="Time"
                value={profile.reminderTimes.map(formatTimeHHMM).join(', ')}
                onPress={() => setReminderModalVisible(true)}
              />
            )}
          </View>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PRIVACY</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Privacy lock</Text>
                <Text style={styles.rowSubtext}>
                  Require Face ID to open this app
                </Text>
              </View>
              <Switch
                value={privacyLock}
                onValueChange={(v) => {
                  setPrivacyLock(v);
                  persistProfile({ biometricLockEnabled: v });
                }}
                trackColor={{ false: Colors.border, true: Colors.primaryDim }}
                thumbColor={privacyLock ? Colors.primary : Colors.textMuted}
              />
            </View>
          </View>
        </View>

        {/* Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FOR HARD MOMENTS</Text>
          <View style={styles.card}>
            <SettingRow
              label="Your why"
              value={(profile as any)?.whyNote ? 'Written' : 'Not set'}
              onPress={() => router.push('/why-note')}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <View style={styles.card}>
            <SettingRow label="About this app" onPress={() => setAboutVisible(true)} />
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA</Text>
          <View style={styles.card}>
            <SettingRow
              label="Bring to your appointment"
              value="PDF summary"
              onPress={() => router.push('/export-summary')}
            />
            <TouchableOpacity style={styles.row} onPress={handleDeleteAllData} activeOpacity={0.7}>
              <Text style={styles.deleteLabel}>Delete all my data</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.deleteHint}>
            Permanently erases everything — check-ins, journal entries, saved providers, and your profile. Cannot be undone.
          </Text>
        </View>
      </ScrollView>

      <ReminderModal
        visible={reminderModalVisible}
        initialTimes={profile.reminderTimes}
        initialNote={profile.reminderNote}
        onClose={() => setReminderModalVisible(false)}
        onSave={handleReminderSave}
      />

      <StartDateModal
        visible={startDateModalVisible}
        initialDate={profile.treatmentStartDate}
        onClose={() => setStartDateModalVisible(false)}
        onSave={handleStartDateSave}
      />

      <AboutModal visible={aboutVisible} onClose={() => setAboutVisible(false)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.xl },
  title: { ...Typography.h1, marginBottom: 4 },
  sub: { ...Typography.bodySmall },

  section: { gap: Spacing.sm },
  sectionLabel: {
    ...Typography.eyebrow,
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rowLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  rowSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  chevron: {
    fontSize: 18,
    color: Colors.textMuted,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  modalTitle: {
    ...Typography.h2,
  },
  modalLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  modalInput: {
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    alignItems: 'center',
    backgroundColor: Colors.surfaceRaised,
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  aboutCloseBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginTop: Spacing.md,
  },
  modalSaveText: {
    color: Colors.textInverse,
    fontSize: 15,
    fontWeight: '600',
  },
  deleteLabel: {
    fontSize: 15,
    color: Colors.error,
  },
  deleteHint: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
    paddingHorizontal: 2,
  },
  aboutParagraph: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
});
