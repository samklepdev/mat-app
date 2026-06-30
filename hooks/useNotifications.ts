import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

export const MEDICATION_REMINDER_TASK = 'MEDICATION_REMINDER_TASK';
export const MEDICATION_TAKEN_ACTION = 'MEDICATION_TAKEN';

// ─── Notification behavior ────────────────────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// ─── Register notification category with action button ────────────────────────

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

// ─── Request permissions ──────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Schedule daily medication reminder ───────────────────────────────────────

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

// ─── Cancel reminder ──────────────────────────────────────────────────────────

export async function cancelMedicationReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync('medication-reminder');
}

// ─── Cancel today's reminder after taken ─────────────────────────────────────

export async function dismissTodaysReminder(): Promise<void> {
  await Notifications.dismissNotificationAsync('medication-reminder');
}

// ─── Hook — wire up response listener ────────────────────────────────────────

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
