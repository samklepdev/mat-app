import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { formatTimeHHMM, parseTimeHHMM } from '../../utils/date';

const MAX_TIMES = 6;

interface ReminderTimesEditorProps {
  times: string[];
  onChange: (times: string[]) => void;
}

// Add/remove UI for one or more daily reminder times — e.g. medication taken
// twice a day gets two reminders. The most-recently-added time is always the
// one shown in the live picker; earlier times are frozen rows with a remove
// button. Used in both onboarding and Settings so the two stay consistent.
export function ReminderTimesEditor({ times, onChange }: ReminderTimesEditorProps) {
  const activeIndex = times.length - 1;

  const updateActiveTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const updated = [...times];
    updated[activeIndex] = `${h}:${m}`;
    onChange(updated);
  };

  const removeTime = (index: number) => {
    if (times.length <= 1) return;
    onChange(times.filter((_, i) => i !== index));
  };

  const addTime = () => {
    if (times.length >= MAX_TIMES) return;
    const last = times[times.length - 1] ?? '08:00';
    const [h, m] = last.split(':').map(Number);
    const next = `${String((h + 12) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    onChange([...times, next]);
  };

  return (
    <View style={styles.wrapper}>
      {times.slice(0, -1).map((t, i) => (
        <View key={i} style={styles.frozenRow}>
          <Text style={styles.frozenTime}>{formatTimeHHMM(t)}</Text>
          <TouchableOpacity onPress={() => removeTime(i)} hitSlop={10}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      <DateTimePicker
        value={parseTimeHHMM(times[activeIndex] ?? '08:00')}
        mode="time"
        display="spinner"
        onChange={(_, date) => date && updateActiveTime(date)}
        themeVariant="dark"
        style={styles.picker}
      />

      <View style={styles.actionsRow}>
        {times.length > 1 && (
          <TouchableOpacity onPress={() => removeTime(activeIndex)} hitSlop={10}>
            <Text style={styles.removeText}>Remove this time</Text>
          </TouchableOpacity>
        )}
        {times.length < MAX_TIMES && (
          <TouchableOpacity onPress={addTime} hitSlop={10} style={styles.addBtn}>
            <Text style={styles.addText}>+ Add another time</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.sm },
  frozenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  frozenTime: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  removeText: {
    fontSize: 13,
    color: Colors.error,
  },
  picker: {
    height: 150,
    marginLeft: -10,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addBtn: {
    marginLeft: 'auto',
  },
  addText: {
    ...Typography.label,
    fontSize: 14,
    color: Colors.primary,
  },
});
