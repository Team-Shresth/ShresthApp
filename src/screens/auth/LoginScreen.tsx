import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

interface LoginScreenProps {
  navigation: any;
}

const ROLES: Array<{ id: 'shipment_user' | 'administrator'; label: string }> = [
  { id: 'shipment_user', label: 'Shipment User' },
  { id: 'administrator', label: 'Administrator' },
];

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'shipment_user' | 'administrator'>('shipment_user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const result = await login(email, password, role);
      if (result.requiresOtp) {
        navigation.navigate('OTP', { userId: result.userId });
      }
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padded avoidKeyboard>
      <View style={styles.header}>
        <View style={styles.logoMark}>
          <Text style={styles.logoGlyph}>S</Text>
        </View>
        <Text style={styles.eyebrow}>Secure access</Text>
        <Text style={styles.title}>Shresth</Text>
        <Text style={styles.subtitle}>Farm-to-Fork Cold Chain Traceability</Text>
      </View>

      <View style={styles.formCard}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="priya@freshmart.in"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="any password accepted"
          secureTextEntry
        />

        <View>
          <Text style={styles.fieldLabel}>Role</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => {
              const active = role === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleBtn, active && styles.roleBtnActive]}
                  onPress={() => setRole(r.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.roleBtnText, active && styles.roleBtnTextActive]}>{r.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Continue" onPress={handleLogin} loading={loading} style={styles.cta} />

      <View style={styles.demoHint}>
        <Text style={styles.demoHintTitle}>Demo accounts</Text>
        <Text style={styles.demoHintText}>Shipment user · priya@freshmart.in</Text>
        <Text style={styles.demoHintText}>Admin · rohan@shresth.gov.in</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.section,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.greenSoft,
    borderWidth: 1,
    borderColor: theme.colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.gap,
  },
  logoGlyph: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.green,
    fontFamily: theme.fonts.mono,
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
    fontSize: 30,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.secondaryText,
    marginTop: 6,
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    ...theme.shadow.card,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  roleRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.muted,
    alignItems: 'center',
  },
  roleBtnActive: {
    backgroundColor: theme.colors.green,
    borderColor: theme.colors.green,
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.secondaryText,
  },
  roleBtnTextActive: {
    color: '#FFFFFF',
  },
  error: {
    color: theme.colors.red,
    fontSize: 13,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  cta: {
    marginTop: theme.spacing.gap,
  },
  demoHint: {
    marginTop: 'auto',
    paddingTop: theme.spacing.section,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  demoHintTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
  },
  demoHintText: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    fontFamily: theme.fonts.mono,
    marginTop: 2,
  },
});
