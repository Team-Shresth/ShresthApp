import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getShipments } from '../../db/database';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { theme } from '../../constants/theme';
import type { Shipment, ShipmentStatus } from '../../types';

const ALERT_STATUSES: ShipmentStatus[] = ['tamper_detected', 'live_breach'];

export default function AdminAlertsScreen() {
  const [alerts, setAlerts] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const all = await getShipments();
      setAlerts(all.filter(s => ALERT_STATUSES.includes(s.status)));
    } catch (e) {
      console.error('Failed to load alerts:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <Screen scroll padded style={{ justifyContent: 'center' }}>
        <Text style={styles.loadingText}>Loading alerts…</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll padded onRefresh={loadAlerts} refreshing={refreshing}>
      <ScreenHeader
        title="Alerts"
        subtitle={`${alerts.length} active alert${alerts.length !== 1 ? 's' : ''}`}
      />

      <View style={styles.listLabelRow}>
        <Text style={styles.listLabel}>Active Alerts</Text>
        <Text style={styles.listCount}>{alerts.length}</Text>
      </View>

      {alerts.length === 0 ? (
        <EmptyState glyph="✓" title="All Clear" message="No tamper events or live breaches detected." />
      ) : (
        alerts.map((item: Shipment) => (
          <TouchableOpacity
            style={[styles.alertCard, item.status === 'tamper_detected' ? styles.alertCardRed : styles.alertCardAmber]}
            key={item.batch_id}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ShipmentDetail', { shipment: item })}
          >
            <View style={styles.alertHeader}>
              <Text style={styles.batchId}>{item.batch_id}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.product}>{item.product_name}</Text>
            <Text style={styles.route}>{item.origin} → {item.destination}</Text>
            <Text style={styles.farmer}>Farmer: {item.farmer_name}</Text>
          </TouchableOpacity>
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
  alertCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.card,
  },
  alertCardRed: { backgroundColor: theme.colors.redSoft, borderColor: theme.colors.red },
  alertCardAmber: { backgroundColor: theme.colors.amberSoft, borderColor: theme.colors.amber },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  batchId: { fontSize: 15, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.mono },
  product: { fontSize: 13, color: theme.colors.text, marginTop: 2 },
  route: { fontSize: 12, color: theme.colors.secondaryText, marginTop: 2 },
  farmer: { fontSize: 11, color: theme.colors.secondaryText, marginTop: 4 },
  loadingText: { fontSize: 14, color: theme.colors.secondaryText, textAlign: 'center' },
});
