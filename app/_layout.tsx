import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import { getProfile, initDatabase } from "../db";
import { registerNotificationCategory } from "../hooks/useNotifications";
import { useUserStore } from "../store";
import "../tasks/medicationTask";
import { UserProfile } from "../types";

function mapRowToProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    displayName: (row.display_name as string) ?? undefined,
    treatmentStartDate: row.treatment_start_date as string,
    onboardingComplete: row.onboarding_complete === 1,
    notificationsEnabled: row.notifications_enabled === 1,
    biometricLockEnabled: row.biometric_lock_enabled === 1,
    reminderTime: (row.reminder_time as string) ?? "08:00",
    reminderNote: (row.reminder_note as string) ?? undefined,
    dailyCost: (row.daily_cost as number) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const { setProfile } = useUserStore();

  useEffect(() => {
    initDatabase();
    registerNotificationCategory(); // ensure 'I took it' action is registered
    const row = getProfile();

    if (row) {
      setProfile(mapRowToProfile(row));
      setReady(true);
      router.replace("/(tabs)");
    } else {
      setReady(true);
      router.replace("/onboarding");
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
          animation: "fade",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="find-care" options={{ headerShown: false }} />
        <Stack.Screen name="saved-providers" options={{ headerShown: false }} />
        <Stack.Screen name="learn" options={{ headerShown: false }} />
        <Stack.Screen
          name="learn-article"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="journal-write"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen name="wins" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
