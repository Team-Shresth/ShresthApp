import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getReadingsByBatchId } from '../../db/database';
import { verifyChain, CoreReadingFields } from '../../utils/hashChain';
import { journeyStages } from '../../constants/theme';
import { LineChart } from '../../components/LineChart';
import { QRCode } from '../../components/QRCode';
import StatusBadge from '../../components/StatusBadge';
import { JourneyTimeline } from '../../components/JourneyTimeline';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import { theme } from '../../constants/theme';
import type { RootStackParamList, Shipment, Reading, ChainVerification } from '../../types';

export default function ShipmentDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ShipmentDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { shipment } = route.params;
  const handleBack = () => navigation.goBack();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<ChainVerification | null>(null);

  useEffect(() => {
    loadDetails();
  }, [shipment.batch_id]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const batchReadings = await getReadingsByBatchId(shipment.batch_id);
      setReadings(batchReadings);

      const coreReadings: CoreReadingFields[] = batchReadings.map((r: Reading) => ({
        batch_id: r.batch_id,
        device_id: r.device_id,
        reading_index: r.reading_index,
        timestamp: r.timestamp,
        temperature_c: r.temperature_c,
        humidity_pct: r.humidity_pct,
        ethylene_ppm: r.ethylene_ppm,
        gps_lat: r.gps_lat,
        gps_lon: r.gps_lon,
        hash: r.hash,
        prev_hash: r.prev_hash,
      }));

      const verificationResult = await verifyChain(coreReadings);
      setVerification(verificationResult);
    } catch (error) {
      console.error('Failed to load shipment details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Screen scroll padded style={{ justifyContent: 'center' }}>
        <ScreenHeader title={shipment.batch_id} subtitle={shipment.product_name} onBack={handleBack} />
        <Text style={styles.loadingText}>Loading shipment details…</Text>
      </Screen>
    );
  }

  if (readings.length === 0) {
    return (
      <Screen padded>
        <ScreenHeader title={shipment.batch_id} subtitle={shipment.product_name} onBack={handleBack} />
        <EmptyState glyph="◌" title="No readings" message="No environmental readings available for this shipment." />
      </Screen>
    );
  }

  const temps: number[] = readings.map((r: Reading) => r.temperature_c);
  const ethylene: number[] = readings.map((r: Reading) => r.ethylene_ppm);

  const avgTemp = temps.length ? (temps.reduce((sum: number, value: number) => sum + value, 0) / temps.length).toFixed(1) : '—';
  const maxEthylene = ethylene.length ? Math.max(...ethylene).toFixed(0) : '—';
  const chainState = verification?.isTampered ? 'Tamper detected' : 'Chain verified';

  return (
    <Screen scroll padded>
      <ScreenHeader
        title={shipment.batch_id}
        subtitle={shipment.product_name}
        onBack={handleBack}
      />

      <View style={styles.metaCard}>
        <View style={styles.metaTopRow}>
          <StatusBadge status={shipment.status} />
          <Text style={styles.metaValue}>{shipment.status.replace(/_/g, ' ')}</Text>
        </View>
        <Text style={styles.routeText}>{shipment.origin} → {shipment.destination}</Text>
        <Text style={styles.farmerText}>Farmer: {shipment.farmer_name}</Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Avg temp</Text>
          <Text style={styles.metricValue}>{avgTemp}°C</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Max ethylene</Text>
          <Text style={styles.metricValue}>{maxEthylene} ppm</Text>
        </View>
        <View style={[styles.metricCard, verification?.isTampered ? styles.metricCardAlert : undefined]}>
          <Text style={styles.metricLabel}>Chain</Text>
          <Text style={[styles.metricValue, verification?.isTampered ? styles.metricValueAlert : undefined]}>{chainState}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Journey Timeline</Text>
        <JourneyTimeline
          steps={journeyStages.map((label, idx) => ({
            label,
            status: idx < 2 ? 'completed' :
                   idx === 2 && verification?.isTampered ? 'current' :
                   idx === 2 && (!verification?.isTampered) ? 'completed' :
                   idx > 2 && (!verification?.isTampered) ? 'completed' : 'pending',
          }))}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Temperature Monitoring</Text>
        {temps.length >= 2 ? (
          <LineChart data={temps} color={theme.colors.red} />
        ) : (
          <EmptyState glyph="◌" title="Insufficient data" message="Not enough readings to plot a chart yet." />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ethylene Monitoring</Text>
        {ethylene.length >= 2 ? (
          <LineChart data={ethylene} color={theme.colors.amber} />
        ) : (
          <EmptyState glyph="◌" title="Insufficient data" message="Not enough readings to plot a chart yet." />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hash Chain Verification</Text>
        {verification && (
          <View style={styles.hashContainer}>
            <Text
              style={[
                styles.hashLabel,
                { color: verification.isTampered ? theme.colors.red : theme.colors.green },
              ]}
            >
              Chain status: {verification.isTampered ? 'TAMPER DETECTED' : 'VERIFIED'}
            </Text>
            {verification.isTampered && (
              <View style={styles.hashDetail}>
                <Text style={styles.hashText}>Tamper at reading: {verification.tamperReadingIndex}</Text>
                <Text style={styles.hashText}>Expected hash: {verification.expectedHash?.slice(0, 16)}…</Text>
                <Text style={styles.hashText}>Stored hash: {verification.storedHash?.slice(0, 16)}…</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Impact Assessment</Text>
        <View style={styles.impactCard}>
          <Text style={styles.impactLabel}>Fuel Saved vs. Cargo Value at Risk</Text>
          <View style={styles.impactRow}>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>120 L</Text>
              <Text style={styles.impactSub}>Fuel saved</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>₹{shipment.total_value?.toLocaleString()}</Text>
              <Text style={styles.impactSub}>Value at risk</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Batch Information</Text>
        <View style={styles.qrWrap}>
          <QRCode value={shipment.batch_id} size={200} />
        </View>
        <Text style={styles.qrLabel}>{shipment.batch_id}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metaCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.card,
  },
  metaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    color: theme.colors.secondaryText,
  },
  routeText: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginTop: theme.spacing.sm },
  farmerText: { fontSize: 13, color: theme.colors.secondaryText, marginTop: theme.spacing.xs },
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    ...theme.shadow.card,
  },
  metricCardAlert: {
    backgroundColor: theme.colors.redSoft,
    borderColor: theme.colors.red,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    color: theme.colors.secondaryText,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  metricValueAlert: {
    color: theme.colors.red,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.card,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: theme.colors.secondaryText,
    marginBottom: theme.spacing.sm,
  },
  hashContainer: { backgroundColor: theme.colors.muted, padding: theme.spacing.md, borderRadius: theme.radius.sm },
  hashLabel: { fontSize: 14, fontWeight: '600', marginBottom: theme.spacing.sm },
  hashDetail: { marginTop: theme.spacing.xs, gap: 2 },
  hashText: { fontSize: 12, color: theme.colors.text, fontFamily: theme.fonts.mono },
  impactCard: { backgroundColor: theme.colors.muted, padding: theme.spacing.md, borderRadius: theme.radius.sm },
  impactLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.secondaryText, marginBottom: theme.spacing.md, textAlign: 'center' },
  impactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  impactItem: { flex: 1, alignItems: 'center' },
  impactDivider: { width: 1, height: 28, backgroundColor: theme.colors.border },
  impactValue: { fontSize: 20, fontWeight: '700', color: theme.colors.text, fontVariant: ['tabular-nums'] },
  impactSub: { fontSize: 11, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3, color: theme.colors.secondaryText, marginTop: theme.spacing.xs },
  qrWrap: { alignItems: 'center', paddingVertical: theme.spacing.sm },
  qrLabel: { textAlign: 'center', marginTop: theme.spacing.sm, fontSize: 13, color: theme.colors.secondaryText, fontFamily: theme.fonts.mono },
  loadingText: { fontSize: 14, color: theme.colors.secondaryText, textAlign: 'center' },
});