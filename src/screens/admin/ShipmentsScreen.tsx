import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getShipments } from '../../db/database';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { theme } from '../../constants/theme';
import type { Shipment, RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AdminShipmentsScreen() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    setLoading(true);
    try {
      const all = await getShipments();
      setShipments(all);
    } catch (e) {
      console.error('Failed to load shipments:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading && shipments.length === 0) {
    return (
      <Screen scroll padded style={{ justifyContent: 'center' }}>
        <Text style={styles.loadingText}>Loading shipments…</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll padded onRefresh={loadShipments} refreshing={refreshing}>
      <ScreenHeader title="All Shipments" subtitle={`${shipments.length} shipments in fleet`} />

      <View style={styles.listLabelRow}>
        <Text style={styles.listLabel}>Shipments</Text>
        <Text style={styles.listCount}>{shipments.length}</Text>
      </View>

      {shipments.length === 0 ? (
        <EmptyState glyph="▦" title="No shipments found" message="Shipments will appear here once created." />
      ) : (
        shipments.map((item) => (
          <TouchableOpacity
            style={styles.card}
            key={item.batch_id}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ShipmentDetail', { shipment: item })}
          >
            <View style={styles.cardInfo}>
              <Text style={styles.batchId}>{item.batch_id}</Text>
              <Text style={styles.product}>{item.product_name}</Text>
              <Text style={styles.route}>{item.origin} → {item.destination}</Text>
              <Text style={styles.farmer}>{item.farmer_name}</Text>
            </View>
            <View style={styles.cardRight}>
              <StatusBadge status={item.status} />
              <Text style={styles.chevron}>›</Text>
            </View>
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
  card: {
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
  cardInfo: { flex: 1, minWidth: 0, marginRight: theme.spacing.sm },
  batchId: { fontSize: 15, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.mono },
  product: { fontSize: 13, color: theme.colors.secondaryText, marginTop: 2 },
  route: { fontSize: 12, color: theme.colors.secondaryText, marginTop: 2 },
  farmer: { fontSize: 11, color: theme.colors.mutedText, marginTop: 4 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  chevron: { fontSize: 18, color: theme.colors.mutedText, marginTop: -2 },
  loadingText: { fontSize: 14, color: theme.colors.secondaryText, textAlign: 'center' },
});