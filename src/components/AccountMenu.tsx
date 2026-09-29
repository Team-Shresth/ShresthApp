import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import type { User } from '../types';
import { theme } from '../constants/theme';

interface AccountMenuProps {
  user: User | null;
  onSignOut: () => void;
}

function getStoredMode(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.localStorage.getItem('shresth-color-mode') === 'dark' ? 'dark' : 'light';
}

export default function AccountMenu({ user, onSignOut }: AccountMenuProps) {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<'light' | 'dark'>(getStoredMode);
  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'U';
  const isDark = mode === 'dark';

  const handleModeChange = (nextDark: boolean) => {
    const nextMode = nextDark ? 'dark' : 'light';
    setMode(nextMode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('shresth-color-mode', nextMode);
      window.location.reload();
    }
  };

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setVisible(true)} accessibilityLabel="Open account menu">
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.triggerText}>
          <Text style={styles.triggerName} numberOfLines={1}>{user?.name ?? 'Account'}</Text>
          <Text style={styles.triggerRole}>{user?.role === 'administrator' ? 'Administrator' : 'Shipment User'}</Text>
        </View>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.menu} onPress={() => undefined}>
            <View style={styles.profileRow}>
              <View style={styles.largeAvatar}>
                <Text style={styles.largeAvatarText}>{initials}</Text>
              </View>
              <View style={styles.profileText}>
                <Text style={styles.name}>{user?.name ?? 'Account'}</Text>
                <Text style={styles.email}>{user?.email ?? ''}</Text>
                <Text style={styles.role}>{user?.role === 'administrator' ? 'Administrator' : 'Shipment User'}</Text>
              </View>
            </View>

            <View style={styles.divider} />
            <View style={styles.menuRow}>
              <Text style={styles.menuIcon}>⚙</Text>
              <Text style={styles.menuLabel}>Settings</Text>
              <Text style={styles.comingSoon}>Soon</Text>
            </View>
            <View style={styles.menuRow}>
              <Text style={styles.menuIcon}>{isDark ? '☾' : '☀'}</Text>
              <Text style={styles.menuLabel}>{isDark ? 'Dark mode' : 'Light mode'}</Text>
              <Switch
                value={isDark}
                onValueChange={handleModeChange}
                trackColor={{ false: theme.colors.border, true: theme.colors.greenSoft }}
                thumbColor={isDark ? theme.colors.green : theme.colors.surface}
              />
            </View>
            <Pressable
              style={({ pressed }) => [styles.signOutRow, pressed && styles.pressed]}
              onPress={() => {
                setVisible(false);
                onSignOut();
              }}
            >
              <Text style={styles.signOutIcon}>↪</Text>
              <Text style={styles.signOutLabel}>Sign Out</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 190,
    padding: 6,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  avatar: { width: 28, height: 28, borderRadius: theme.radius.full, backgroundColor: theme.colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: theme.colors.green, fontSize: 11, fontWeight: '700', fontFamily: theme.fonts.mono },
  triggerText: { flex: 1, minWidth: 0, marginHorizontal: 6 },
  triggerName: { color: theme.colors.text, fontSize: 11, fontWeight: '700' },
  triggerRole: { color: theme.colors.secondaryText, fontSize: 9, marginTop: 1 },
  chevron: { color: theme.colors.secondaryText, fontSize: 16, marginTop: -3 },
  backdrop: { flex: 1, alignItems: 'flex-end', paddingTop: 64, paddingRight: theme.spacing.page, backgroundColor: theme.colors.overlay },
  menu: { width: 280, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, ...theme.shadow.raised },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  largeAvatar: { width: 44, height: 44, borderRadius: theme.radius.full, backgroundColor: theme.colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  largeAvatarText: { color: theme.colors.green, fontSize: 15, fontWeight: '700', fontFamily: theme.fonts.mono },
  profileText: { flex: 1, minWidth: 0, marginLeft: theme.spacing.sm },
  name: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  email: { color: theme.colors.secondaryText, fontSize: 11, marginTop: 2 },
  role: { color: theme.colors.green, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 4 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.sm },
  menuRow: { flexDirection: 'row', alignItems: 'center', minHeight: 42 },
  menuIcon: { width: 28, color: theme.colors.secondaryText, fontSize: 17, textAlign: 'center' },
  menuLabel: { flex: 1, color: theme.colors.text, fontSize: 13, fontWeight: '600', marginLeft: theme.spacing.sm },
  comingSoon: { color: theme.colors.mutedText, fontSize: 10, fontFamily: theme.fonts.mono },
  signOutRow: { flexDirection: 'row', alignItems: 'center', minHeight: 42, borderTopWidth: 1, borderTopColor: theme.colors.border, marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm },
  signOutIcon: { width: 28, color: theme.colors.red, fontSize: 17, textAlign: 'center' },
  signOutLabel: { color: theme.colors.red, fontSize: 13, fontWeight: '700', marginLeft: theme.spacing.sm },
  pressed: { opacity: 0.65 },
});
