import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getShipments } from '../../db/database';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import StatCard from '../../components/StatCard';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import AccountMenu from '../../components/AccountMenu';
import { theme } from '../../constants/theme';
import type { RootStackParamList } from '../../navigation/MainStack';

export default function OverviewScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadShipments();
  }, [user?.id]);

  const loadShipments = async () => {
    setLoading(true);
    try {
      const allShipments = await getShipments();
      const userShipments = allShipments.filter((s: any) => s.farmer_email === user?.email);
      setShipments(userShipments);
    } catch (e) {
      console.error('Failed to load shipments:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const verifiedCount = shipments.filter((s) => s.status === 'verified_delivered').length;
  const alertCount = shipments.filter(
    (s) => s.status === 'tamper_detected' || s.status === 'live_breach'
  ).length;

  if (loading && shipments.length === 0) {
    return (
      <Screen scroll padded style={{ justifyContent: 'center' }}>
        <Text style={styles.loadingText}>Loading your shipments…</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll padded onRefresh={loadShipments} refreshing={refreshing}>
      <ScreenHeader
        title="Overview"
        subtitle={`${user?.name ?? 'Your'}'s shipments`}
        right={<AccountMenu user={user} onSignOut={logout} />}
      />

      <View style={styles.statsRow}>
        <StatCard label="Total" value={shipments.length} glyph="▦" />
        <StatCard label="Verified" value={verifiedCount} accent={theme.colors.green} glyph="✓" />
        <StatCard label="Alerts" value={alertCount} accent={theme.colors.red} glyph="⚠" />
      </View>

      <View style={styles.listLabelRow}>
        <Text style={styles.listLabel}>Shipments</Text>
        <Text style={styles.listCount}>{shipments.length}</Text>
      </View>

      {shipments.length === 0 ? (
        <EmptyState
          glyph="▦"
          title="No shipments found"
          message="Shipments assigned to you will appear here."
        />
      ) : (
        shipments.map((item) => (
          <TouchableOpacity
            key={item.batch_id}
            style={styles.shipmentCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ShipmentDetail', { shipment: item })}
          >
            <View style={styles.shipmentInfo}>
              <Text style={styles.batchId}>{item.batch_id}</Text>
              <Text style={styles.productName}>{item.product_name}</Text>
              <Text style={styles.routeText}>
                {item.origin} → {item.destination}
              </Text>
            </View>
            <View style={styles.badgeWrap}>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.gap,
  },
  listLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  listLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listCount: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.mutedText,
  },
  shipmentCard: {
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
  shipmentInfo: {
    flex: 1,
    minWidth: 0,
  },
  batchId: {
    fontFamily: theme.fonts.mono,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
  productName: {
    fontSize: 13,
    color: theme.colors.secondaryText,
    marginTop: 2,
    fontWeight: '500',
  },
  routeText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    marginTop: 2,
  },
  badgeWrap: {
    marginLeft: theme.spacing.sm,
  },
  chevron: {
    fontSize: 18,
    lineHeight: 20,
    color: theme.colors.mutedText,
    marginLeft: theme.spacing.xs,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.secondaryText,
    textAlign: 'center',
  },
});