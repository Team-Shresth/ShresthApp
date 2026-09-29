import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Camera, CameraView, type BarcodeScanningResult } from 'expo-camera';
import { useVerifyShipment } from '../../hooks/useVerifyShipment';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { theme } from '../../constants/theme';

export default function UserVerifyScreen() {
  const [batchId, setBatchId] = useState('');
  const { verify, verifying } = useVerifyShipment();
  const [result, setResult] = useState<{ type: 'verified' | 'tampered' | 'live_breach' | 'error'; message: string; data?: any } | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => setCameraPermission(status === 'granted'));
  }, []);

  const resultMeta = result
    ? result.type === 'verified'
      ? { label: 'Verified', color: theme.colors.green, soft: theme.colors.greenSoft }
      : result.type === 'tampered'
        ? { label: 'Tampered', color: theme.colors.red, soft: theme.colors.redSoft }
        : result.type === 'live_breach'
          ? { label: 'Live breach', color: theme.colors.amber, soft: theme.colors.amberSoft }
          : { label: 'Not found', color: theme.colors.secondaryText, soft: theme.colors.muted }
    : null;

  const handleVerify = async () => {
    setScanned(true);
    const res = await verify(batchId);
    setResult(res);
  };

  const handleScanPress = () => {
    if (cameraPermission !== true) {
      Alert.alert('Camera permission needed', 'Please grant camera access to scan QR codes');
      return;
    }
    setScanning(true);
  };

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (!scanning || !data) return;
    const scannedBatchId = extractBatchId(data);
    setScanning(false);
    if (!scannedBatchId) {
      Alert.alert('Unsupported QR code', 'This QR code does not contain a Shresth batch ID.');
      return;
    }
    setBatchId(scannedBatchId);
    setScanned(true);
    const res = await verify(scannedBatchId);
    setResult(res);
  };

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
      <ScreenHeader title="Verify Shipment" subtitle="Scan or enter batch ID to verify" />

      <View style={styles.formCard}>
        <Input
          label="Batch ID"
          placeholder="Enter batch ID (e.g., BB-2375)"
          value={batchId}
          onChangeText={setBatchId}
          onSubmitEditing={handleVerify}
          returnKeyType="go"
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <View style={styles.btnRow}>
          <Button
            title="Verify"
            onPress={handleVerify}
            loading={verifying}
            disabled={batchId.trim().length === 0}
            style={styles.btnFlex}
          />
          <Button title="Scan QR" variant="secondary" onPress={handleScanPress} style={styles.btnFlex} />
        </View>
      </View>

      {scanned && result && resultMeta && (
        <View style={[styles.resultCard, { borderColor: resultMeta.color, backgroundColor: resultMeta.soft }]}>
          <View style={styles.resultHeader}>
            <View style={[styles.resultDot, { backgroundColor: resultMeta.color }]} />
            <Text style={[styles.resultLabel, { color: resultMeta.color }]}>{resultMeta.label}</Text>
          </View>
          <Text style={styles.resultTitle}>{result.message}</Text>
          {result.data && (
            <View style={styles.dataBox}>
              {result.data.validCount != null && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Valid readings</Text>
                  <Text style={styles.dataValue}>{result.data.validCount}/{result.data.totalCount}</Text>
                </View>
              )}
              {result.data.tempDrift !== undefined && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Temp drift</Text>
                  <Text style={styles.dataValue}>{result.data.tempDrift.toFixed(1)}°C</Text>
                </View>
              )}
              {result.data.ethyleneDrift !== undefined && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Ethylene drift</Text>
                  <Text style={styles.dataValue}>{result.data.ethyleneDrift.toFixed(1)} ppm</Text>
                </View>
              )}
              {result.type === 'tampered' && result.data.tamperedReading && result.data.shipment && (
                <View style={styles.tamperDetails}>
                  <Text style={styles.tamperTitle}>Tamper details</Text>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Shipment</Text>
                    <Text style={styles.dataValue}>{result.data.shipment.product_name}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Detected at</Text>
                    <Text style={styles.dataValue}>{new Date(result.data.tamperedReading.timestamp).toLocaleString()}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Location</Text>
                    <Text style={styles.dataValue}>{result.data.tamperedReading.gps_lat.toFixed(5)}, {result.data.tamperedReading.gps_lon.toFixed(5)}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Device</Text>
                    <Text style={styles.dataValue}>{result.data.tamperedReading.device_id}</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Reading values</Text>
                    <Text style={styles.dataValue}>{result.data.tamperedReading.temperature_c.toFixed(1)}°C · {result.data.tamperedReading.humidity_pct.toFixed(1)}% RH · {result.data.tamperedReading.ethylene_ppm.toFixed(1)} ppm</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Previous hash</Text>
                    <Text style={styles.dataValue}>{result.data.tamperedReading.prev_hash.slice(0, 16)}…</Text>
                  </View>
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Reading hash</Text>
                    <Text style={styles.dataValue}>{result.data.tamperedReading.hash.slice(0, 16)}…</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </Screen>
  );
}

function extractBatchId(data: string): string | null {
  const value = data.trim();
  if (/^BB-\d+$/i.test(value)) return value.toUpperCase();

  try {
    const url = new URL(value);
    const batchId = url.searchParams.get('batch') || url.searchParams.get('batchId') || url.pathname.match(/BB-\d+/i)?.[0];
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
  btnRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  btnFlex: { flex: 1 },
  resultCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginTop: theme.spacing.gap,
    ...theme.shadow.card,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  resultDot: { width: 10, height: 10, borderRadius: 5 },
  resultLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  resultTitle: { fontSize: 15, fontWeight: '600', color: theme.colors.text, lineHeight: 22 },
  dataBox: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dataLabel: { fontSize: 12, color: theme.colors.secondaryText },
  dataValue: { fontSize: 12, color: theme.colors.text, fontFamily: theme.fonts.mono, fontWeight: '600' },
  tamperDetails: { borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm },
  tamperTitle: { fontSize: 12, fontWeight: '700', color: theme.colors.red, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: theme.spacing.xs },
  cameraCard: { height: 420, overflow: 'hidden', borderRadius: theme.radius.lg, backgroundColor: '#161813', ...theme.shadow.card },
  camera: { flex: 1 },
  scanFrame: { position: 'absolute', width: 220, height: 220, alignSelf: 'center', top: 100, borderWidth: 2, borderColor: theme.colors.green, borderRadius: theme.radius.md },
  cancelScan: { marginTop: theme.spacing.gap },
});