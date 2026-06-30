import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { MEDICATION_REMINDER_TASK, MEDICATION_TAKEN_ACTION } from '../hooks/useNotifications';
import { todayLocalISO } from '../utils/date';

// ─── Background task definition ───────────────────────────────────────────────
// This runs when the user taps "Mark as taken" even if the app is closed.

TaskManager.defineTask(MEDICATION_REMINDER_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('Medication reminder task error:', error);
    return;
  }

  const response = data?.notification?.request?.content;
  const actionId = data?.actionIdentifier;

  if (actionId !== MEDICATION_TAKEN_ACTION) return;

  try {
    // Dynamically import SQLite to avoid issues if not yet initialized
    const { upsertCheckIn } = await import('../db');
    const now = new Date();
    const today = todayLocalISO();

    upsertCheckIn({
      id: `checkin-${today}`,
      date: today,
      mood: 0,        // not set from notification
      sleep: 0,       // not set from notification
      cravings: 0,    // not set from notification
      tookMedication: true,
      createdAt: now.toISOString(),
    });

    // Dismiss the notification
    await Notifications.dismissAllNotificationsAsync();

  } catch (err) {
    console.error('Failed to mark medication as taken:', err);
  }
});
