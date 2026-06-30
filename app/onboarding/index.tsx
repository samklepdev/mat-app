import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors, Radius, Spacing, Typography } from "../../constants/theme";
import { db } from "../../db";
import { useUserStore } from "../../store";
import { MedicationType, UserProfile } from "../../types";

const { width } = Dimensions.get("window");

const MEDICATIONS: { type: MedicationType; label: string; sub: string }[] = [
  { type: "buprenorphine", label: "Buprenorphine", sub: "Subutex" },
  { type: "suboxone", label: "Suboxone", sub: "Buprenorphine / Naloxone" },
  { type: "sublocade", label: "Sublocade", sub: "Monthly injection" },
  { type: "methadone", label: "Methadone", sub: "Clinic-based treatment" },
  { type: "naltrexone", label: "Naltrexone", sub: "Vivitrol / oral" },
  { type: "vivitrol", label: "Vivitrol", sub: "Monthly injection" },
  { type: "other", label: "Something else", sub: "Other MAT medication" },
];

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
      ))}
    </View>
  );
}

// ─── Screen 1: Welcome ────────────────────────────────────────────────────────

function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={styles.welcomeContent}>
        <View style={styles.welcomeTop}>
          <Text style={styles.eyebrow}>MAT SUPPORT</Text>
          <Text style={styles.welcomeTitle}>This is{"\n"}your space.</Text>
          <Text style={styles.welcomeBody}>
            No tracking. No judgment.{"\n"}Just you and your treatment.
          </Text>
        </View>

        <View style={styles.welcomeFooter}>
          <Text style={styles.welcomeNote}>
            Everything stays on your device.{"\n"}No account required to get
            started.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onNext}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Get started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Screen 2: Name ──────────────────────────────────────────────────────────

function NameScreen({
  value,
  onChange,
  onNext,
  onSkip,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      <View style={styles.stepContent}>
        <View>
          <Text style={styles.eyebrow}>STEP 1 OF 3</Text>
          <Text style={styles.stepTitle}>What should{"\n"}we call you?</Text>
          <Text style={styles.stepSub}>
            Optional. Just makes this feel a little more like yours.
          </Text>
        </View>

        <TextInput
          style={styles.textInput}
          placeholder="Your name"
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChange}
          autoFocus
          returnKeyType="next"
          onSubmitEditing={onNext}
        />

        <View style={styles.stepActions}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !value.trim() && styles.primaryButtonDim,
            ]}
            onPress={onNext}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSkip} activeOpacity={0.6}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Screen 3: Medication ─────────────────────────────────────────────────────

function MedicationScreen({
  selected,
  onSelect,
  startDate,
  onDateChange,
  onNext,
}: {
  selected: MedicationType | null;
  onSelect: (t: MedicationType) => void;
  startDate: string;
  onDateChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.stepContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text style={styles.eyebrow}>STEP 2 OF 3</Text>
          <Text style={styles.stepTitle}>Your medication</Text>
          <Text style={styles.stepSub}>
            Every medication is different. This helps us speak your language.
          </Text>
        </View>

        <View style={styles.medList}>
          {MEDICATIONS.map((m) => (
            <TouchableOpacity
              key={m.type}
              style={[
                styles.medOption,
                selected === m.type && styles.medOptionActive,
              ]}
              onPress={() => onSelect(m.type)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.medLabel,
                  selected === m.type && styles.medLabelActive,
                ]}
              >
                {m.label}
              </Text>
              <Text style={styles.medSub}>{m.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>
            When did you start your medication?
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="MM / DD / YYYY"
            placeholderTextColor={Colors.textMuted}
            value={startDate}
            onChangeText={onDateChange}
            keyboardType="numeric"
          />
          <Text style={styles.dateHint}>
            Approximate is fine — this is just for your records.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !selected && styles.primaryButtonDim]}
          onPress={onNext}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ─── Screen 4: Notifications ──────────────────────────────────────────────────

function NotificationsScreen({
  onEnable,
  onSkip,
  reminderTime,
  onTimeChange,
  reminderNote,
  onNoteChange,
}: {
  onEnable: () => void;
  onSkip: () => void;
  reminderTime: string;
  onTimeChange: (t: string) => void;
  reminderNote: string;
  onNoteChange: (n: string) => void;
}) {
  // Parse HH:MM for display
  const [hours, minutes] = reminderTime.split(":").map(Number);
  const displayTime = new Date();
  displayTime.setHours(hours, minutes, 0, 0);
  const timeLabel = displayTime.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const handleTimeChange = (_: any, date?: Date) => {
    if (!date) return;
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    onTimeChange(`${h}:${m}`);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.stepContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text style={styles.eyebrow}>STEP 3 OF 3</Text>
          <Text style={styles.stepTitle}>A quiet reminder</Text>
          <Text style={styles.stepSub}>
            Once a day. Just enough to check in with yourself.
          </Text>
        </View>

        {/* Time picker */}
        <View>
          <Text style={styles.dateLabel}>What time works for you?</Text>
          <DateTimePicker
            value={displayTime}
            mode="time"
            display="spinner"
            onChange={handleTimeChange}
            themeVariant="dark"
            style={styles.timePicker}
          />
        </View>

        {/* Note field */}
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Add a note (optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. leave for clinic"
            placeholderTextColor={Colors.textMuted}
            value={reminderNote}
            onChangeText={onNoteChange}
          />
        </View>

        {/* Preview */}
        <View style={styles.notifCard}>
          <Text style={styles.notifPreview}>◈ Time for your medication.</Text>
          {reminderNote.trim() ? (
            <Text style={styles.notifNote}>{reminderNote}</Text>
          ) : null}
          <Text style={styles.notifTime}>Every day · {timeLabel}</Text>
        </View>

        <View style={styles.stepActions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onEnable}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Turn on reminders</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSkip} activeOpacity={0.6}>
            <Text style={styles.skipText}>Not right now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Root Onboarding ──────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [medication, setMedication] = useState<MedicationType | null>(null);
  const [startDate, setStartDate] = useState("");
  const [reminderTime, setReminderTime] = useState("08:00");
  const [reminderNote, setReminderNote] = useState("");
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { setProfile } = useUserStore();

  const totalSteps = 4;

  const animateNext = (toStep: number) => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
    setStep(toStep);
  };

  const next = () => animateNext(step + 1);

  const finish = (notificationsEnabled: boolean) => {
    const now = new Date().toISOString();

    // Parse date input MM/DD/YYYY → ISO
    const parts = startDate.replace(/\s/g, "").split("/");
    const parsedDate =
      parts.length === 3
        ? new Date(
            `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`,
          )
            .toISOString()
            .split("T")[0]
        : new Date().toISOString().split("T")[0];

    const profile: UserProfile = {
      id: "local-user",
      displayName: name.trim() || undefined,
      treatmentStartDate: parsedDate,
      onboardingComplete: true,
      notificationsEnabled,
      biometricLockEnabled: false,
      reminderTime,
      reminderNote: reminderNote.trim() || undefined,
      createdAt: now,
    };

    // Persist to SQLite
    db.runSync(
      `INSERT OR REPLACE INTO user_profile
        (id, display_name, treatment_start_date, onboarding_complete, notifications_enabled, biometric_lock_enabled, created_at)
       VALUES (?, ?, ?, 1, ?, 0, ?)`,
      [
        profile.id,
        profile.displayName ?? null,
        profile.treatmentStartDate,
        notificationsEnabled ? 1 : 0,
        profile.createdAt,
      ],
    );

    setProfile(profile);
    router.replace("/(tabs)");
  };

  const screens = [
    <WelcomeScreen onNext={next} />,
    <NameScreen value={name} onChange={setName} onNext={next} onSkip={next} />,
    <MedicationScreen
      selected={medication}
      onSelect={setMedication}
      startDate={startDate}
      onDateChange={setStartDate}
      onNext={() => medication && next()}
    />,
    <NotificationsScreen
      onEnable={() => finish(true)}
      onSkip={() => finish(false)}
      reminderTime={reminderTime}
      onTimeChange={setReminderTime}
      reminderNote={reminderNote}
      onNoteChange={setReminderNote}
    />,
  ];

  return (
    <View style={[styles.safe, { width: "100%", height: "100%" }]}>
      {/* Dots — hidden on welcome screen */}
      {step > 0 && (
        <View style={styles.dotsContainer}>
          <StepDots current={step - 1} total={totalSteps - 1} />
        </View>
      )}

      <Animated.View
        style={[
          styles.animContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {screens[step]}
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: Colors.background,
  },
  dotsContainer: {
    paddingTop: Spacing.md,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 16,
  },
  animContainer: {
    flex: 1,
    width: "100%",
  },
  screen: {
    flex: 1,
    width: "100%",
  },

  // Welcome
  welcomeContent: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: "space-between",
    paddingBottom: Spacing.xl,
  },
  welcomeTop: {
    paddingTop: Spacing.xxl,
    gap: Spacing.lg,
  },
  welcomeTitle: {
    ...Typography.h1,
    fontSize: 48,
    fontWeight: "200",
    letterSpacing: -2,
    lineHeight: 54,
  },
  welcomeBody: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  welcomeFooter: {
    gap: Spacing.lg,
  },
  welcomeNote: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    lineHeight: 20,
  },

  // Steps
  stepContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  eyebrow: {
    ...Typography.eyebrow,
    marginBottom: Spacing.sm,
  },
  stepTitle: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  stepSub: {
    ...Typography.bodySmall,
    lineHeight: 20,
  },
  stepActions: {
    gap: Spacing.md,
    alignItems: "center",
  },

  // Input
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 16,
    letterSpacing: 0.2,
  },

  // Medication picker
  medList: {
    gap: Spacing.sm,
  },
  medOption: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  medOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDim,
  },
  medLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  medLabelActive: {
    color: Colors.textPrimary,
  },
  medSub: {
    fontSize: 12,
    color: Colors.textMuted,
    letterSpacing: 0.1,
  },

  // Date
  dateBlock: {
    gap: Spacing.sm,
  },
  dateLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  dateHint: {
    fontSize: 12,
    color: Colors.textMuted,
  },

  // Notification preview
  notifCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  notifPreview: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  notifTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  notifNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timePicker: {
    marginLeft: -10,
    height: 150,
  },

  // Buttons
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: "center",
    width: "100%",
  },
  primaryButtonDim: {
    backgroundColor: Colors.surfaceRaised,
  },
  primaryButtonText: {
    ...Typography.label,
    color: Colors.textInverse,
  },
  skipText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
});
