import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';

// Box breathing: inhale 4s → hold 4s → exhale 4s → hold 4s.
// Calming, simple, and clinically used for acute stress and craving waves.

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

const PHASES: { key: Phase; label: string; seconds: number }[] = [
  { key: 'inhale', label: 'Breathe in', seconds: 4 },
  { key: 'hold-in', label: 'Hold', seconds: 4 },
  { key: 'exhale', label: 'Breathe out', seconds: 4 },
  { key: 'hold-out', label: 'Hold', seconds: 4 },
];

export function BreathingExercise() {
  const scale = useRef(new Animated.Value(0.5)).current;
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [running, setRunning] = useState(true);
  const [cycles, setCycles] = useState(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    let cancelled = false;

    const runPhase = (index: number) => {
      if (cancelled) return;
      const phase = PHASES[index];
      setPhaseIndex(index);

      const animation =
        phase.key === 'inhale'
          ? Animated.timing(scale, {
              toValue: 1,
              duration: phase.seconds * 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          : phase.key === 'exhale'
          ? Animated.timing(scale, {
              toValue: 0.5,
              duration: phase.seconds * 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          : Animated.delay(phase.seconds * 1000);

      animation.start(({ finished }) => {
        if (finished && !cancelled) {
          const next = (index + 1) % PHASES.length;
          if (next === 0) setCycles((c) => c + 1);
          phaseRef.current = next;
          runPhase(next);
        }
      });
    };

    runPhase(phaseRef.current);
    return () => {
      cancelled = true;
      scale.stopAnimation();
    };
  }, [running]);

  const currentPhase = PHASES[phaseIndex];

  return (
    <View style={styles.container}>
      <View style={styles.circleWrap}>
        <Animated.View
          style={[
            styles.circle,
            { transform: [{ scale }] },
          ]}
        />
        <View style={styles.circleCenter}>
          <Text style={styles.phaseLabel}>{currentPhase.label}</Text>
        </View>
      </View>

      <Text style={styles.cycleCount}>
        {cycles === 0 ? 'Follow the circle' : `${cycles} ${cycles === 1 ? 'breath' : 'breaths'} complete`}
      </Text>

      <TouchableOpacity onPress={() => setRunning((r) => !r)} style={styles.pauseBtn} hitSlop={10}>
        <Text style={styles.pauseText}>{running ? 'Pause' : 'Resume'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.lg },
  circleWrap: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Colors.primaryDim,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  circleCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseLabel: {
    fontSize: 22,
    fontWeight: '300',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  cycleCount: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  pauseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  pauseText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '500',
  },
});
