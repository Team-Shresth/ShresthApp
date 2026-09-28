import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import type { ShipmentStatus } from '../types';

const statusMeta: Record<ShipmentStatus, { label: string; color: string; soft: string }> = {
  verified_delivered: { label: 'Verified Delivered', color: theme.colors.green, soft: theme.colors.greenSoft },
  offline_recording: { label: 'Offline Recording', color: theme.colors.amber, soft: theme.colors.amberSoft },
  tamper_detected: { label: 'Tamper Detected', color: theme.colors.red, soft: theme.colors.redSoft },
  live_breach: { label: 'Live Breach', color: theme.colors.amber, soft: theme.colors.amberSoft },
  in_transit: { label: 'In Transit', color: theme.colors.secondaryText, soft: 'rgba(124,118,102,0.10)' },
};

export default function StatusBadge({ status }: { status: ShipmentStatus }) {
  const meta = statusMeta[status] ?? statusMeta.in_transit;
  return (
    <View style={[styles.badge, { backgroundColor: meta.soft }]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});