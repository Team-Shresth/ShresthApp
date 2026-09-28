import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  /** Optional accent color for the value */
  accent?: string;
  /** Optional small glyph rendered above the value */
  glyph?: string;
}

export default function StatCard({ label, value, accent, glyph }: StatCardProps) {
  return (
    <View style={styles.card}>
      {glyph ? <Text style={styles.glyph}>{glyph}</Text> : null}
      <Text style={[styles.value, accent ? { color: accent } : null]}>{value}</Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md + 2,
    paddingHorizontal: theme.spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    ...theme.shadow.card,
  },
  glyph: {
    fontSize: 13,
    color: theme.colors.mutedText,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
    color: theme.colors.text,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    color: theme.colors.secondaryText,
    marginTop: 6,
  },
});
