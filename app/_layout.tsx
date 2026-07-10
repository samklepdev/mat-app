import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { initDatabase, getProfile } from '../db';
import '../tasks/medicationTask'; // register background task at startup
import {
  registerNotificationCategory,
  scheduleReflectionNotification,
  useEngagementNotificationRouting,
} from '../hooks/useNotifications';
import { useUserStore } from '../store';
import { UserProfile } from '../types';

function parseReminderTimes(row: Record<string, unknown>): string[] {
  const raw = row.reminder_times as string | null;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // Fall through to the legacy single-time column below.
    }
  }
  return [(row.reminder_time as string) ?? '08:00'];
}

function mapRowToProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    displayName: (row.display_name as string) ?? undefined,
    treatmentStartDate: row.treatment_start_date as string,
    onboardingComplete: row.onboarding_complete === 1,
    notificationsEnabled: row.notifications_enabled === 1,
    biometricLockEnabled: row.biometric_lock_enabled === 1,
    reminderTimes: parseReminderTimes(row),
    reminderNote: (row.reminder_note as string) ?? undefined,
    dailyCost: (row.daily_cost as number) ?? undefined,
    whyNote: (row.why_note as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const { setProfile } = useUserStore();

  useEngagementNotificationRouting();

  useEffect(() => {
    initDatabase();
    registerNotificationCategory(); // ensure 'I took it' action is registered
    const row = getProfile();

    if (row) {
      const profile = mapRowToProfile(row);
      setProfile(profile);
      setReady(true);
      router.replace('/(tabs)');

      // Reschedule tomorrow's reflection notification on every launch, since
      // a single repeating trigger can't carry different text each day.
      if (profile.notificationsEnabled) {
        scheduleReflectionNotification();
      }
    } else {
      setReady(true);
      router.replace('/onboarding');
    }
  }, []);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="saved-providers" options={{ headerShown: false }} />
        <Stack.Screen name="learn-article" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="journal-write" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="wins" options={{ headerShown: false }} />
        <Stack.Screen name="right-now" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="why-note" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="export-summary" options={{ headerShown: false }} />
        <Stack.Screen name="medications" options={{ headerShown: false }} />
        <Stack.Screen name="medication-detail" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
