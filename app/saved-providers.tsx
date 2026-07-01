import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { getSavedProviders, removeProvider, updateProviderNotes } from '../db';
import { SavedProvider } from '../types';

function mapRowToProvider(row: Record<string, unknown>): SavedProvider {
  return {
    id: row.id as string,
    name: row.name as string,
    street1: row.street1 as string,
    city: row.city as string,
    state: row.state as string,
    zip: row.zip as string,
    phone: (row.phone as string) ?? undefined,
    website: (row.website as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    savedAt: row.saved_at as string,
  };
}

function ProviderCard({
  provider,
  onRemove,
  onNotesChange,
}: {
  provider: SavedProvider;
  onRemove: (id: string) => void;
  onNotesChange: (id: string, notes: string) => void;
}) {
  const [notes, setNotes] = useState(provider.notes ?? '');
  const [editing, setEditing] = useState(false);

  const handleCall = () => {
    if (provider.phone) {
      Linking.openURL(`tel:${provider.phone.replace(/[^\d]/g, '')}`);
    }
  };

  const handleDirections = () => {
    const query = encodeURIComponent(
      `${provider.street1}, ${provider.city}, ${provider.state} ${provider.zip}`
    );
    Linking.openURL(`https://maps.apple.com/?address=${query}`);
  };

  const handleRemove = () => {
    Alert.alert('Remove provider?', `This will remove ${provider.name} from your saved list.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onRemove(provider.id) },
    ]);
  };

  const handleNotesBlur = () => {
    setEditing(false);
    if (notes !== provider.notes) {
      onNotesChange(provider.id, notes);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardName}>{provider.name}</Text>
          <Text style={styles.cardAddress}>
            {provider.street1}, {provider.city}, {provider.state} {provider.zip}
          </Text>
        </View>
        <TouchableOpacity onPress={handleRemove} hitSlop={10} style={styles.removeBtn}>
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardActions}>
        {provider.phone && (
          <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
            <Text style={styles.actionBtnText}>Call</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionBtn} onPress={handleDirections}>
          <Text style={styles.actionBtnText}>Directions</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        value={notes}
        onChangeText={setNotes}
        onFocus={() => setEditing(true)}
        onBlur={handleNotesBlur}
        placeholder="Add a note — hours, who you spoke with, next steps…"
        placeholderTextColor={Colors.textMuted}
        style={[styles.notesInput, editing && styles.notesInputActive]}
        multiline
      />
    </View>
  );
}

export default function SavedProvidersScreen() {
  const [providers, setProviders] = useState<SavedProvider[]>([]);

  const loadProviders = useCallback(() => {
    const rows = getSavedProviders();
    setProviders(rows.map(mapRowToProvider));
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const handleRemove = (id: string) => {
    removeProvider(id);
    loadProviders();
  };

  const handleNotesChange = (id: string, notes: string) => {
    updateProviderNotes(id, notes);
    loadProviders();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.title}>Saved providers</Text>
          <Text style={styles.sub}>Always one tap away.</Text>
        </View>

        {providers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Nothing saved yet. Find care nearby and tap the star to keep it here.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {providers.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                onRemove={handleRemove}
                onNotesChange={handleNotesChange}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  backButton: {
    fontSize: 16,
    color: Colors.primary,
  },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.lg },
  title: { ...Typography.h1, marginBottom: 4 },
  sub: { ...Typography.bodySmall },

  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  list: { gap: Spacing.sm },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  removeBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtnText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  notesInput: {
    fontSize: 13,
    color: Colors.textSecondary,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    minHeight: 44,
    lineHeight: 18,
  },
  notesInputActive: {
    borderColor: Colors.primary,
  },
});
