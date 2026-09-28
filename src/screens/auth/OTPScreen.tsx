import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import Screen from '../../components/Screen';
import Button from '../../components/Button';

interface OTPScreenProps {
  navigation: any;
  route: { params: { userId: string; otpCode: string; onVerify: (userId: string, code: string) => Promise<boolean> } };
}

export default function OTPScreen({ navigation, route }: OTPScreenProps) {
  const { userId, otpCode, onVerify } = route.params;
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [focusIndex, setFocusIndex] = useState(0);
  const [error, setError] = useState('');
  const [showCode, setShowCode] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleDigitChange = (text: string, idx: number) => {
    if (!/^\d*$/.test(text)) return;
    const ch = text.slice(-1);
    const newDigits = [...digits];
    newDigits[idx] = ch;
    setDigits(newDigits);
    if (ch && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
      setFocusIndex(idx + 1);
    }
    if (ch && idx === 5) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        submitCode(fullCode);
      }
    }
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !digits[idx] && idx > 0) {
      const newDigits = [...digits];
      newDigits[idx - 1] = '';
      setDigits(newDigits);
      inputRefs.current[idx - 1]?.focus();
      setFocusIndex(idx - 1);
    }
  };

  const submitCode = async (code?: string) => {
    const finalCode = code ?? digits.join('');
    if (finalCode.length !== 6) {
      setError('Enter all 6 digits');
      return;
    }
    if (verifying) return;
    setVerifying(true);
    setError('');
    try {
      const ok = await onVerify(userId, finalCode);
      if (!ok) {
        setError('Invalid code. Please try again.');
        setDigits(['', '', '', '', '', '']);
        setFocusIndex(0);
        inputRefs.current[0]?.focus();
      }
    } catch (e) {
      setError('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Screen padded avoidKeyboard>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Verification</Text>
        <Text style={styles.title}>Two-Factor Authentication</Text>
        <Text style={styles.subtitle}>A 6-digit code has been generated for this demo.</Text>
        <TouchableOpacity
          onPress={() => setShowCode(!showCode)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.6}
        >
          <Text style={styles.toggle}>{showCode ? 'Hide code' : 'Show code'}</Text>
        </TouchableOpacity>
        {showCode && otpCode ? (
          <View style={styles.codeWrap}>
            <Text style={styles.codeDisplay}>{otpCode}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <View style={styles.digitRow}>
          {digits.map((d, i) => (
            <View key={i} style={[styles.digitBox, i === focusIndex && styles.digitBoxFocus]}>
              <TextInput
                ref={ref => {
                  inputRefs.current[i] = ref;
                }}
                style={styles.digitInput}
                maxLength={1}
                value={d}
                onChangeText={(t) => handleDigitChange(t, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="numeric"
                autoFocus={i === 0}
                selectionColor={theme.colors.green}
              />
            </View>
          ))}
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Verify" onPress={() => submitCode()} loading={verifying} style={styles.cta} />

      <View style={styles.footerHint}>
        <Text style={styles.footerHintText}>Enter the code shown above</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.section,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.green,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.secondaryText,
    marginTop: 6,
  },
  toggle: {
    color: theme.colors.green,
    marginTop: theme.spacing.sm,
    fontSize: 12,
    fontWeight: '600',
  },
  codeWrap: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.greenSoft,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.green,
    paddingHorizontal: theme.spacing.gap,
    paddingVertical: 10,
    marginTop: theme.spacing.md,
  },
  codeDisplay: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.green,
    fontFamily: theme.fonts.mono,
    letterSpacing: 6,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    ...theme.shadow.card,
  },
  digitRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  digitBox: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBoxFocus: {
    borderColor: theme.colors.green,
    borderWidth: 2,
    backgroundColor: theme.colors.greenSoft,
  },
  digitInput: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.mono,
    textAlign: 'center',
    width: 40,
  },
  error: {
    color: theme.colors.red,
    fontSize: 13,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  cta: {
    marginTop: theme.spacing.gap,
  },
  footerHint: {
    marginTop: 'auto',
    paddingTop: theme.spacing.section,
  },
  footerHintText: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    textAlign: 'center',
  },
});