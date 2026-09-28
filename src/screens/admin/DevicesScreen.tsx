import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getDevices } from '../../db/database';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import { theme } from '../../constants/theme';
import type { Device } from '../../types';

export default function AdminDevicesScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const allDevices = await getDevices();
      setDevices(allDevices);
    } catch (e) {
      console.error('Failed to load devices:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading && devices.length === 0) {
    return (
      <Screen scroll padded style={{ justifyContent: 'center' }}>
        <Text style={styles.loadingText}>Loading devices…</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll padded onRefresh={loadDevices} refreshing={refreshing}>
      <ScreenHeader title="Devices" subtitle="Fleet device status" />

      <View style={styles.listLabelRow}>
        <Text style={styles.listLabel}>Fleet Devices</Text>
        <Text style={styles.listCount}>{devices.length}</Text>
    </View>

      {devices.length === 0 ? (
        <EmptyState glyph="▦" title="No devices found" message="Registered IoT devices will appear here." />
      ) : (
        devices.map((item) => (
          <View style={styles.deviceCard} key={item.id}>
            <View style={styles.deviceInfo}>
              <View style={styles.deviceNameRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: item.status === 'online' ? theme.colors.green : theme.colors.mutedText },
                  ]}
                />
                <Text style={styles.deviceId}>{item.serial_number}</Text>
              </View>
              <Text style={styles.deviceLocation}>{item.location}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{item.battery_pct}%</Text>
              <Text style={styles.metricLabel}>Batt</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{item.storage_pct}%</Text>
              <Text style={styles.metricLabel}>Sto</Text>
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  listLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: theme.colors.secondaryText,
  },
  listCount: { fontSize: 12, color: theme.colors.mutedText, fontFamily: theme.fonts.mono },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.card,
  },
  deviceInfo: { flex: 1, minWidth: 0 },
  deviceNameRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  deviceId: { fontSize: 15, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.mono },
  deviceLocation: { fontSize: 13, color: theme.colors.secondaryText, marginTop: 2 },
  metric: { alignItems: 'center', minWidth: 44 },
  metricValue: { fontSize: 15, fontWeight: '700', color: theme.colors.text, fontVariant: ['tabular-nums'] },
  metricLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    color: theme.colors.mutedText,
    marginTop: 2,
  },
  metricDivider: { width: 1, height: 24, backgroundColor: theme.colors.border, marginHorizontal: theme.spacing.sm },
  loadingText: { fontSize: 14, color: theme.colors.secondaryText, textAlign: 'center' },
});