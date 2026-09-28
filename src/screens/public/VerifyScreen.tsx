import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
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

export default function PublicVerifyScreen() {
  const { user } = useAuth();
  const [batchId, setBatchId] = useState('');
  const { verify, verifying } = useVerifyShipment();
  const [result, setResult] = useState<{ type: ResultType; message: string; data?: any } | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [hasCamera, setHasCamera] = useState(true);

  React.useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        setHasCamera(false);
        setCameraPermission(true);
        return;
      }
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    })();
  }, []);

  const handleScanPress = async () => {
    if (cameraPermission !== true) {
      Alert.alert('Camera permission needed', 'Please grant camera access to scan QR codes');
      return;
    }
    Alert.alert('QR Scanner', 'Enter the batch ID in the text field below, or use a development build with camera scanning enabled.');
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