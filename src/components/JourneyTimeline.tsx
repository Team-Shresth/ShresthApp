import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

export interface JourneyStep {
  label: string;
  status: 'completed' | 'current' | 'pending';
  detail?: string;
}

/**
 * Vertical journey timeline: check/dot rail with connecting line,
 * stage label and optional detail per step.
 */
export function JourneyTimeline({ steps }: { steps: JourneyStep[] }) {
  return (
    <View style={styles.container}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const isCompleted = step.status === 'completed';
        const isCurrent = step.status === 'current';

        const circleBg = isCompleted
          ? theme.colors.green
          : isCurrent
            ? theme.colors.greenSoft
            : theme.colors.muted;
        const circleBorder = isCompleted || isCurrent ? theme.colors.green : theme.colors.border;
        const labelColor = isCompleted || isCurrent ? theme.colors.text : theme.colors.mutedText;

        return (
          <View key={`${step.label}-${idx}`} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.circle, { backgroundColor: circleBg, borderColor: circleBorder }]}>
                {isCompleted ? (
                  <Text style={styles.check}>✓</Text>
                ) : (
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: isCurrent ? theme.colors.green : theme.colors.mutedText },
                    ]}
                  />
                )}
              </View>
              {!isLast && (
                <View style={[styles.line, isCompleted && { backgroundColor: theme.colors.green }]} />
              )}
            </View>
            <View style={styles.content}>
              <Text style={[styles.label, { color: labelColor }]}>{step.label}</Text>
              {step.detail ? <Text style={styles.detail}>{step.detail}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
  },
  rail: {
    width: 24,
    alignItems: 'center',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 13,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  line: {
    width: 1.5,
    flex: 1,
    minHeight: 14,
    backgroundColor: theme.colors.border,
  },
  content: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 16,
    paddingTop: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
  },
  detail: {
    fontSize: 11,
    color: theme.colors.secondaryText,
    marginTop: 2,
    lineHeight: 14,
  },
});