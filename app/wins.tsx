import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Radius, Spacing, Typography } from "../constants/theme";
import { addWin, deleteWin, getWins, updateDailyCost } from "../db";
import { useUserStore } from "../store";
import { parseLocalISO, todayLocalISO } from "../utils/date";

interface Win {
  id: string;
  text: string;
  date: string;
  createdAt: string;
}

function mapRow(row: Record<string, unknown>): Win {
  return {
    id: row.id as string,
    text: row.text as string,
    date: row.date as string,
    createdAt: row.created_at as string,
  };
}

function daysSince(iso: string): number {
  const start = parseLocalISO(iso);
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000));
}

export default function WinsScreen() {
  const { profile } = useUserStore();
  const [wins, setWins] = useState<Win[]>([]);
  const [newWin, setNewWin] = useState("");
  const [costInput, setCostInput] = useState("");
  const [editingCost, setEditingCost] = useState(false);

  const dailyCost = (profile as any)?.dailyCost as number | undefined;
  const treatmentDays = profile ? daysSince(profile.treatmentStartDate) : 0;
  const moneySaved = dailyCost ? Math.round(dailyCost * treatmentDays) : null;

  const load = useCallback(() => {
    setWins(getWins(100).map(mapRow));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleAdd = () => {
    if (!newWin.trim()) return;
    addWin({
      id: `win-${Date.now()}`,
      text: newWin.trim(),
      date: todayLocalISO(),
      createdAt: new Date().toISOString(),
    });
    setNewWin("");
    load();
  };

  const handleDelete = (id: string) => {
    Alert.alert("Remove this win?", "", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          deleteWin(id);
          load();
        },
      },
    ]);
  };

  const handleSaveCost = () => {
    const parsed = parseFloat(costInput);
    if (!isNaN(parsed) && parsed > 0) {
      updateDailyCost(parsed);
      // update in-memory profile so the number shows immediately
      if (profile) {
        useUserStore
          .getState()
          .setProfile({ ...(profile as any), dailyCost: parsed });
      }
    }
    setEditingCost(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.title}>Life rebuilt</Text>
          <Text style={styles.sub}>
            The record of everything you're getting back.
          </Text>
        </View>

        {/* Money saved */}
        <View style={styles.moneyCard}>
          {moneySaved !== null ? (
            <>
              <Text style={styles.eyebrow}>NOT SPENT</Text>
              <View style={styles.moneyRow}>
                <Text style={styles.moneyNumber}>
                  ${moneySaved.toLocaleString()}
                </Text>
              </View>
              <Text style={styles.moneySub}>
                {treatmentDays} days × ${dailyCost}/day
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setCostInput(String(dailyCost));
                  setEditingCost(true);
                }}
              >
                <Text style={styles.moneyEdit}>Edit daily amount</Text>
              </TouchableOpacity>
            </>
          ) : editingCost ? null : (
            <>
              <Text style={styles.eyebrow}>NOT SPENT</Text>
              <Text style={styles.moneySetupText}>
                Roughly what did a day cost, before? We'll keep a running total
                of what stays in your pocket now. This stays on your device like
                everything else.
              </Text>
              <TouchableOpacity
                style={styles.moneySetupBtn}
                onPress={() => setEditingCost(true)}
              >
                <Text style={styles.moneySetupBtnText}>Set daily amount</Text>
              </TouchableOpacity>
            </>
          )}

          {editingCost && (
            <View style={styles.costEditRow}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                value={costInput}
                onChangeText={setCostInput}
                keyboardType="decimal-pad"
                placeholder="60"
                placeholderTextColor={Colors.textMuted}
                style={styles.costInput}
                autoFocus
              />
              <TouchableOpacity
                onPress={handleSaveCost}
                style={styles.costSaveBtn}
              >
                <Text style={styles.costSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Add a win */}
        <View style={styles.addSection}>
          <Text style={styles.sectionLabel}>WINS</Text>
          <Text style={styles.winsHint}>
            License back. First paycheck. Called your mom. The milestones that
            don't fit on a chip.
          </Text>
          <View style={styles.addRow}>
            <TextInput
              value={newWin}
              onChangeText={setNewWin}
              placeholder="What did you get back?"
              placeholderTextColor={Colors.textMuted}
              style={styles.addInput}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
            <TouchableOpacity
              onPress={handleAdd}
              disabled={!newWin.trim()}
              style={[styles.addBtn, !newWin.trim() && styles.addBtnDim]}
            >
              <Text style={styles.addBtnText}>＋</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Wins list */}
        {wins.length > 0 && (
          <View style={styles.winsList}>
            {wins.map((win) => (
              <TouchableOpacity
                key={win.id}
                style={styles.winCard}
                onLongPress={() => handleDelete(win.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.winText}>{win.text}</Text>
                <Text style={styles.winDate}>
                  {parseLocalISO(win.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  backRow: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  backButton: { fontSize: 16, color: Colors.primary },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.xl },
  title: { ...Typography.h1, marginBottom: 4 },
  sub: { ...Typography.bodySmall },

  moneyCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  eyebrow: { ...Typography.eyebrow },
  moneyRow: { flexDirection: "row", alignItems: "baseline" },
  moneyNumber: { ...Typography.display, fontSize: 56, letterSpacing: -2 },
  moneySub: { ...Typography.bodySmall, color: Colors.textMuted },
  moneyEdit: { fontSize: 12, color: Colors.primary, marginTop: Spacing.xs },
  moneySetupText: {
    ...Typography.bodySmall,
    lineHeight: 20,
    marginVertical: Spacing.xs,
  },
  moneySetupBtn: {
    backgroundColor: Colors.primaryDim,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: "center",
  },
  moneySetupBtnText: {
    fontSize: 14,
    color: Colors.primaryLight,
    fontWeight: "500",
  },
  costEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  dollarSign: { fontSize: 20, color: Colors.textSecondary },
  costInput: {
    flex: 1,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  costSaveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  costSaveText: { color: Colors.textInverse, fontWeight: "600", fontSize: 14 },

  addSection: { gap: Spacing.sm },
  sectionLabel: {
    ...Typography.eyebrow,
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
  winsHint: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  addRow: { flexDirection: "row", gap: Spacing.sm },
  addInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  addBtn: {
    width: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDim: { backgroundColor: Colors.surfaceRaised },
  addBtnText: { fontSize: 20, color: Colors.textInverse },

  winsList: { gap: Spacing.sm },
  winCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.sm,
  },
  winText: { flex: 1, fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  winDate: { fontSize: 11, color: Colors.textMuted },
});
