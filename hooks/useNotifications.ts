import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

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

// ─── Reactive engagement nudges ───────────────────────────────────────────────
// Unlike the fixed-clock reminders above, these meet the person where they
// actually are: silence, or a rough stretch. Both are (re)scheduled locally
// each time their trigger condition is evaluated, so they need no server and
// no background polling — the OS holds the scheduled notification and fires
// it even if the app is never reopened.

const MISSED_CHECKIN_ID = 'missed-checkin-nudge';
const SUPPORTIVE_NUDGE_ID = 'supportive-nudge';

const MISSED_CHECKIN_MESSAGES = [
  "Haven't seen a check-in in a couple days. No pressure — just here whenever you're ready.",
  "It's been quiet for a couple days. This is a nudge, not a judgment.",
];

const SUPPORTIVE_NUDGE_MESSAGES = [
  "The last few days looked a little heavier. You don't have to carry that alone today.",
  "Noticed this week has been harder than most. Showing up still counts, especially now.",
];

function pickRandom(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

// Reschedules a "we noticed the quiet" nudge for 48 hours from now. Call this
// after every check-in (and once notifications are first enabled) so the
// window keeps resetting as long as the person keeps showing up.
export async function scheduleMissedCheckInNudge(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(MISSED_CHECKIN_ID);
  await Notifications.scheduleNotificationAsync({
    identifier: MISSED_CHECKIN_ID,
    content: {
      title: 'Still here.',
      body: pickRandom(MISSED_CHECKIN_MESSAGES),
      data: { type: 'missed-checkin' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 48,
      repeats: false,
    },
  });
}

export async function cancelMissedCheckInNudge(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(MISSED_CHECKIN_ID);
}

// One-shot, quietly supportive message for the next late morning after a
// detected downward trend in mood/comfort — never immediate, so it doesn't
// land right on top of someone admitting a rough day.
export async function scheduleSupportiveNudge(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(SUPPORTIVE_NUDGE_ID);

  const target = new Date();
  target.setDate(target.getDate() + 1);
  target.setHours(11, 0, 0, 0);

  await Notifications.scheduleNotificationAsync({
    identifier: SUPPORTIVE_NUDGE_ID,
    content: {
      title: 'Thinking of you.',
      body: pickRandom(SUPPORTIVE_NUDGE_MESSAGES),
      data: { type: 'supportive-nudge' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: target,
    },
  });
}

export async function cancelSupportiveNudge(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(SUPPORTIVE_NUDGE_ID);
}

// Routes taps on the reactive nudges above to somewhere useful. Mounted once,
// globally, in the root layout — independent of the medication-action
// listener below, so it doesn't change any existing medication-tracking
// behavior.
export function useEngagementNotificationRouting() {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const type = response.notification.request.content.data?.type;
      if (type === 'supportive-nudge') {
        router.push('/right-now');
      }
    });

    return () => sub.remove();
  }, []);
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
