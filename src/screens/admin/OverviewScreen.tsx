import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getDevices, getShipments, getUsers } from '../../db/database';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import StatCard from '../../components/StatCard';
import Button from '../../components/Button';
import { theme } from '../../constants/theme';
import type { Device, Shipment, User } from '../../types';

export default function AdminOverviewScreen() {
  const { logout } = useAuth();
  const [stats, setStats] = useState<{
    devices: Device[];
    shipments: Shipment[];
    users: User[];
    active: number;
    offline: number;
    tampered: number;
    breaches: number;
    verified: number;
    totalShipments: number;
  } | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [devices, shipments, users] = await Promise.all([
      getDevices(),
      getShipments(),
      getUsers(),
    ]);
    setStats({
      devices,
      shipments,
      users,
      active: devices.filter((d) => d.status === 'online').length,
      offline: devices.filter((d) => d.status !== 'online').length,
      tampered: shipments.filter((s) => s.status === 'tamper_detected').length,
      breaches: shipments.filter((s) => s.status === 'live_breach').length,
      verified: shipments.filter((s) => s.status === 'verified_delivered').length,
      totalShipments: shipments.length,
    });
  };

  if (!stats) {
    return (
      <Screen scroll padded style={{ justifyContent: 'center' }}>
        <Text style={styles.loadingText}>Loading fleet overview…</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll padded>
      <ScreenHeader
        title="Fleet Overview"
        subtitle="Administrator dashboard"
        right={<Button small variant="secondary" title="Sign Out" onPress={logout} />}
      />

      <View style={styles.sectionLabelRow}>
        <Text style={styles.sectionLabel}>Ops pulse</Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Total Devices" value={stats.devices.length} glyph="▦" />
        <StatCard label="Online" value={stats.active} glyph="✓" accent={theme.colors.green} />
        <StatCard
          label="Offline"
          value={stats.offline}
          glyph="◌"
          accent={stats.offline > 0 ? theme.colors.amber : undefined}
        />
        <StatCard label="Users" value={stats.users.length} glyph="👥" />
      </View>

      <View style={styles.sectionLabelRow}>
        <Text style={styles.sectionLabel}>Operational status</Text>
      </View>

      <View style={styles.alertsRow}>
        <View style={[styles.alertCard, stats.verified > 0 ? styles.alertCardGreen : undefined]}>
          <Text style={[styles.alertGlyph, { color: stats.verified > 0 ? theme.colors.green : theme.colors.mutedText }]}>✓</Text>
          <Text style={[styles.alertValue, { color: stats.verified > 0 ? theme.colors.green : theme.colors.secondaryText }]}>{stats.verified}</Text>
          <Text style={styles.alertLabel}>Verified</Text>
        </View>
        <View style={[styles.alertCard, stats.tampered > 0 ? styles.alertCardRed : undefined]}>
          <Text style={[styles.alertGlyph, { color: stats.tampered > 0 ? theme.colors.red : theme.colors.mutedText }]}>⚠</Text>
          <Text style={[styles.alertValue, { color: stats.tampered > 0 ? theme.colors.red : theme.colors.secondaryText }]}>{stats.tampered}</Text>
          <Text style={styles.alertLabel}>Tamper Events</Text>
        </View>
        <View style={[styles.alertCard, stats.breaches > 0 ? styles.alertCardAmber : undefined]}>
          <Text style={[styles.alertGlyph, { color: stats.breaches > 0 ? theme.colors.amber : theme.colors.mutedText }]}>⚡</Text>
          <Text style={[styles.alertValue, { color: stats.breaches > 0 ? theme.colors.amber : theme.colors.secondaryText }]}>{stats.breaches}</Text>
          <Text style={styles.alertLabel}>Live Breaches</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Fleet summary</Text>
        <Text style={styles.summaryValue}>{stats.totalShipments}</Text>
        <Text style={styles.summaryMeta}>total shipments tracked</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionLabelRow: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: theme.colors.secondaryText,
  },
  statsRow: { flexDirection: 'row', gap: theme.spacing.sm },
  alertsRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  alertCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    alignItems: 'center',
    minHeight: 112,
    justifyContent: 'center',
    ...theme.shadow.card,
  },
  alertCardGreen: { backgroundColor: theme.colors.greenSoft, borderColor: theme.colors.green },
  alertCardRed: { backgroundColor: theme.colors.redSoft, borderColor: theme.colors.red },
  alertCardAmber: { backgroundColor: theme.colors.amberSoft, borderColor: theme.colors.amber },
  alertGlyph: { fontSize: 16, marginBottom: theme.spacing.xs },
  alertValue: { fontSize: 22, fontWeight: '700', fontVariant: ['tabular-nums'] },
  alertLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    color: theme.colors.secondaryText,
    marginTop: theme.spacing.xs,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginTop: theme.spacing.gap,
    ...theme.shadow.card,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: theme.colors.secondaryText,
  },
  summaryValue: { fontSize: 30, fontWeight: '700', color: theme.colors.text, marginTop: 6 },
  summaryMeta: { fontSize: 12, color: theme.colors.mutedText, marginTop: 4 },
  loadingText: { fontSize: 14, color: theme.colors.secondaryText, textAlign: 'center' },
});