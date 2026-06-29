import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Shadow, Spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  raised?: boolean;
}

export function Card({ children, style, raised = false }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        raised && styles.raised,
        raised && Shadow.md,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  raised: {
    backgroundColor: Colors.surfaceRaised,
  },
});
