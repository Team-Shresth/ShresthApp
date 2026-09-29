import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { Camera, CameraView, type BarcodeScanningResult } from 'expo-camera';
import { useAuth } from '../../context/AuthContext';
import { useVerifyShipment } from '../../hooks/useVerifyShipment';
import { journeyStages } from '../../constants/theme';
import { QRCode } from '../../components/QRCode';
import { JourneyTimeline } from '../../components/JourneyTimeline';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { theme } from '../../constants/theme';

type ResultType = 'verified' | 'tampered' | 'live_breach' | 'error';

const RESULT_META: Record<ResultType, { label: string; color: string; soft: string }> = {
  verified: { label: 'Verified', color: theme.colors.green, soft: theme.colors.greenSoft },
  tampered: { label: 'Tamper Detected', color: theme.colors.red, soft: theme.colors.redSoft },
  live_breach: { label: 'Live Breach', color: theme.colors.amber, soft: theme.colors.amberSoft },
  error: { label: 'Not Found', color: theme.colors.secondaryText, soft: theme.colors.muted },
};

export default function PublicVerifyScreen({ initialBatchId }: { initialBatchId?: string }) {
  const { user } = useAuth();
  const [batchId, setBatchId] = useState('');
  const { verify, verifying } = useVerifyShipment();
  const [result, setResult] = useState<{ type: ResultType; message: string; data?: any } | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [scanning, setScanning] = useState(false);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    })();
  }, []);

  React.useEffect(() => {
    if (!initialBatchId) return;
    setBatchId(initialBatchId);
    void verify(initialBatchId).then(setResult);
  }, [initialBatchId, verify]);

  const handleScanPress = async () => {
    if (!hasCamera) {
      Alert.alert('Camera unavailable', 'Use the batch ID field to verify this QR code in the web preview.');
      return;
    }
    if (cameraPermission !== true) {
      Alert.alert('Camera permission needed', 'Please grant camera access to scan QR codes');
      return;
    }
    setScanning(true);
  };

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (!scanning || !data) return;
    const scannedBatchId = extractBatchId(data);
    if (!scannedBatchId) {
      setScanning(false);
      Alert.alert('Unsupported QR code', 'This QR code does not contain a Shresth batch ID.');
      return;
    }
    setScanning(false);
    setBatchId(scannedBatchId);
    const res = await verify(scannedBatchId);
    setResult(res);
  };

  const handleInputSubmit = async () => {
    if (batchId.trim()) {
      await handleVerify();
    }
  };

  const handleVerify = async () => {
    const res = await verify(batchId);
    setResult(res);
  };

  const meta = result ? RESULT_META[result.type] : null;

  if (scanning) {
    return (
      <Screen padded>
        <ScreenHeader title="Scan Batch QR" subtitle="Center the shipment QR code inside the frame" />
        <View style={styles.cameraCard}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarcodeScanned}
          />
          <View style={styles.scanFrame} />
        </View>
        <Button title="Cancel scan" variant="secondary" onPress={() => setScanning(false)} style={styles.cancelScan} />
      </Screen>
    );
  }

  return (
    <Screen avoidKeyboard padded>
      <ScreenHeader title="Public Verify" subtitle="Scan or enter a batch ID to verify shipment integrity" />

      <View style={styles.formCard}>
        <Input
          label="Batch ID"
          placeholder="e.g., BB-2375"
          value={batchId}
          onChangeText={setBatchId}
          onSubmitEditing={handleInputSubmit}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
        />
        <View style={styles.btnRow}>
          <Button
            title="Verify"
            onPress={handleVerify}
            loading={verifying}
            disabled={batchId.trim().length === 0}
            style={styles.btnFlex}
          />
          <Button
            title="Scan QR"
            variant="secondary"
            onPress={handleScanPress}
            style={styles.btnFlex}
          />
        </View>
      </View>

      {verifying && (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={theme.colors.green} />
          <Text style={styles.loadingText}>Verifying batch…</Text>
        </View>
      )}

      {!verifying && result && meta && (
        <View style={[styles.resultCard, { borderColor: meta.color, backgroundColor: meta.soft }]}>
          <View style={styles.resultHeader}>
            <View style={[styles.resultDot, { backgroundColor: meta.color }]} />
            <Text style={[styles.resultLabel, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <Text style={styles.resultMessage}>{result.message}</Text>

          {result.data && (
            <View style={styles.dataBox}>
              {result.data.shipment && (
                <View style={styles.shipmentDetails}>
                  <Text style={styles.tamperTitle}>Shipment details</Text>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataKey}>Batch ID</Text>
                    <Text style={styles.dataValue}>{result.data.shipment.batch_id}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataKey}>Product</Text>
                    <Text style={styles.dataValue}>{result.data.shipment.product_name}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataKey}>Route</Text>
                    <Text style={styles.dataValue}>{result.data.shipment.origin} → {result.data.shipment.destination}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataKey}>Farmer</Text>
                    <Text style={styles.dataValue}>{result.data.shipment.farmer_name}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataKey}>Status</Text>
                    <Text style={styles.dataValue}>{result.data.shipment.status.replace(/_/g, ' ')}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataKey}>Device</Text>
                    <Text style={styles.dataValue}>{result.data.shipment.device_id}</Text>
                  </View>
                </View>
              )}
              {result.data.validCount != null && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataKey}>Valid readings</Text>
                  <Text style={styles.dataValue}>{result.data.validCount}/{result.data.totalCount}</Text>
                </View>
              )}
              {result.data.tempDrift != null && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataKey}>Temp drift</Text>
                  <Text style={styles.dataValue}>{result.data.tempDrift.toFixed(1)}°C</Text>
                </View>
              )}
              {result.data.ethyleneDrift != null && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataKey}>Ethylene drift</Text>
                  <Text style={styles.dataValue}>{result.data.ethyleneDrift.toFixed(1)} ppm</Text>
                </View>
              )}
              {result.data.expectedHash && (
                <>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataKey}>Expected hash</Text>
                    <Text style={styles.dataValue}>{result.data.expectedHash.slice(0, 16)}…</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataKey}>Stored hash</Text>
                    <Text style={styles.dataValue}>{result.data.storedHash.slice(0, 16)}…</Text>
                  </View>
                </>
              )}
              {result.type === 'tampered' && result.data.tamperedReading && result.data.shipment && (
                <View style={styles.tamperDetails}>
                  <Text style={styles.tamperTitle}>Tamper details</Text>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataKey}>Shipment</Text>
                    <Text style={styles.dataValue}>{result.data.shipment.product_name}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataKey}>Detected at</Text>
                    <Text style={styles.dataValue}>{new Date(result.data.tamperedReading.timestamp).toLocaleString()}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataKey}>Location</Text>
                    <Text style={styles.dataValue}>{result.data.tamperedReading.gps_lat.toFixed(5)}, {result.data.tamperedReading.gps_lon.toFixed(5)}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataKey}>Device</Text>
                    <Text style={styles.dataValue}>{result.data.tamperedReading.device_id}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataKey}>Reading values</Text>
                    <Text style={styles.dataValue}>{result.data.tamperedReading.temperature_c.toFixed(1)}°C · {result.data.tamperedReading.humidity_pct.toFixed(1)}% RH · {result.data.tamperedReading.ethylene_ppm.toFixed(1)} ppm</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataKey}>Previous hash</Text>
                    <Text style={styles.dataValue}>{result.data.tamperedReading.prev_hash.slice(0, 16)}…</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataKey}>Reading hash</Text>
                    <Text style={styles.dataValue}>{result.data.tamperedReading.hash.slice(0, 16)}…</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {!verifying && result && (
        <>
          <View style={styles.qrSection}>
            <Text style={styles.sectionLabel}>Batch QR Code</Text>
            <View style={styles.qrCard}>
              <QRCode value={batchId} size={180} />
            </View>
          </View>

          <View style={styles.timelineSection}>
            <Text style={styles.sectionLabel}>Journey</Text>
            <JourneyTimeline
              steps={journeyStages.map((label, idx) => ({
                label,
                status: idx < 2 ? 'completed' : idx === 2 && result?.type === 'live_breach' ? 'current' : idx === 2 && result?.type === 'tampered' ? 'current' : idx > 2 && (result?.type === 'verified' || result?.type === 'live_breach') ? 'completed' : 'pending',
              }))}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

function extractBatchId(data: string): string | null {
  const value = data.trim();
  if (/^BB-\d+$/i.test(value)) return value.toUpperCase();

  try {
    const url = new URL(value);
    const fromQuery = url.searchParams.get('batch') || url.searchParams.get('batchId');
    const fromPath = url.pathname.match(/BB-\d+/i)?.[0];
    const batchId = fromQuery || fromPath;
    return batchId && /^BB-\d+$/i.test(batchId) ? batchId.toUpperCase() : null;
  } catch {
    return null;
  }
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    ...theme.shadow.card,
  },
  btnRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  btnFlex: { flex: 1 },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.gap,
    paddingVertical: theme.spacing.section,
  },
  loadingText: { fontSize: 14, color: theme.colors.secondaryText },
  cameraCard: {
    height: 420,
    overflow: 'hidden',
    borderRadius: theme.radius.lg,
    backgroundColor: '#161813',
    ...theme.shadow.card,
  },
  camera: { flex: 1 },
  scanFrame: {
    position: 'absolute',
    width: 220,
    height: 220,
    alignSelf: 'center',
    top: 100,
    borderWidth: 2,
    borderColor: theme.colors.green,
    borderRadius: theme.radius.md,
  },
  cancelScan: { marginTop: theme.spacing.gap },
  resultCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginTop: theme.spacing.gap,
    ...theme.shadow.card,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
  resultDot: { width: 10, height: 10, borderRadius: 5 },
  resultLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  resultMessage: { fontSize: 14, color: theme.colors.text, lineHeight: 20 },
  dataBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  dataKey: { fontSize: 12, color: theme.colors.secondaryText },
  dataValue: { fontSize: 12, color: theme.colors.text, fontFamily: theme.fonts.mono },
  tamperDetails: { borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm },
  shipmentDetails: { paddingBottom: theme.spacing.sm, marginBottom: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  tamperTitle: { fontSize: 12, fontWeight: '700', color: theme.colors.red, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: theme.spacing.xs },
  qrSection: {
    marginTop: theme.spacing.section,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
  qrCard: {
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  timelineSection: {
    marginTop: theme.spacing.section,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
});