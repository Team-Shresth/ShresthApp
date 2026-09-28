import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

interface EmptyStateProps {
  glyph?: string;
  title: string;
  message?: string;
}

export default function EmptyState({ glyph = '◌', title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.glyphWrap}>
        <Text style={styles.glyph}>{glyph}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.section + 16,
    paddingHorizontal: theme.spacing.gap,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
  glyphWrap: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  glyph: {
    fontSize: 22,
    color: theme.colors.mutedText,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },
});
