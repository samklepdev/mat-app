import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';

export default function JournalScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>Journal</Text>
        <Text style={styles.sub}>Your record. No one else's.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: Spacing.lg, gap: Spacing.sm },
  title: { ...Typography.h1 },
  sub: { ...Typography.bodySmall },
});
