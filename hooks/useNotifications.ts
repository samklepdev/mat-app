import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export const MEDICATION_TAKEN_ACTION = 'MEDICATION_TAKEN';
export const MEDICATION_REMINDER_TASK = 'MEDICATION_REMINDER_TASK';

// ─── Notification handler ─────────────────────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// ─── Register notification categories ────────────────────────────────────────

export async function registerNotificationCategory() {
  await Notifications.setNotificationCategoryAsync('medication', [
    {
      identifier: MEDICATION_TAKEN_ACTION,
      buttonTitle: 'I took it',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
  ]);
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Daily medication reminder ────────────────────────────────────────────────

export async function scheduleMedicationReminder(
  timeHHMM: string,
  note?: string
): Promise<void> {
  await cancelMedicationReminder();
  const [hours, minutes] = timeHHMM.split(':').map(Number);

  await Notifications.scheduleNotificationAsync({
    identifier: 'medication-reminder',
    content: {
      title: 'Time for your medication.',
      body: note?.trim() || undefined,
      categoryIdentifier: 'medication',
      data: { type: 'medication-reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });
}

export async function cancelMedicationReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync('medication-reminder');
}

export async function dismissTodaysReminder(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}

// ─── Weekly summary — Sunday 7PM ─────────────────────────────────────────────
// Only scheduled manually when the user has logged at least once this week.
// We check and reschedule every Sunday after a check-in is saved.

export async function scheduleWeeklySummary(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync('weekly-summary');

  await Notifications.scheduleNotificationAsync({
    identifier: 'weekly-summary',
    content: {
      title: 'You showed up this week.',
      body: "That's enough.",
      data: { type: 'weekly-summary' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // Sunday (1 = Sunday in Expo's system)
      hour: 19,
      minute: 0,
    },
  });
}

export async function cancelWeeklySummary(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync('weekly-summary');
}

// ─── Milestone notifications ──────────────────────────────────────────────────
// Fired once when the streak hits a milestone. Not AA-style — no fanfare,
// just quiet acknowledgment. We track which milestones have fired in SQLite.

const MILESTONES = [7, 30, 60, 90, 180, 365];

export function getMilestoneForStreak(streak: number): number | null {
  return MILESTONES.find((m) => m === streak) ?? null;
}

export async function fireMilestoneNotification(days: number): Promise<void> {
  const body =
    days === 365
      ? 'A year of consistent treatment. You are still here.'
      : days === 180
      ? 'Six months. Quiet and consistent.'
      : days === 90
      ? 'Three months of showing up.'
      : days === 60
      ? 'Two months of consistent treatment.'
      : days === 30
      ? 'One month. You are doing the work.'
      : 'Seven days of consistent treatment.';

  await Notifications.scheduleNotificationAsync({
    identifier: `milestone-${days}`,
    content: {
      title: `${days} days of consistent treatment.`,
      body,
      data: { type: 'milestone', days },
    },
    trigger: null, // fire immediately
  });
}

// ─── Hook — foreground response listener ─────────────────────────────────────

export function useNotifications(onMedicationTaken: () => void) {
  useEffect(() => {
    registerNotificationCategory();

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      if (response.actionIdentifier === MEDICATION_TAKEN_ACTION) {
        onMedicationTaken();
      }
    });

    return () => sub.remove();
  }, [onMedicationTaken]);
}
