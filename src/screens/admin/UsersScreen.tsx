import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getUsers } from '../../db/database';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import EmptyState from '../../components/EmptyState';
import { theme } from '../../constants/theme';
import type { User, UserRole } from '../../types';

const ROLE_META: Record<UserRole, { label: string; color: string; soft: string }> = {
  administrator: { label: 'Admin', color: theme.colors.green, soft: theme.colors.greenSoft },
  shipment_user: { label: 'Shipment User', color: theme.colors.secondaryText, soft: 'rgba(124,118,102,0.10)' },
};

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const all = await getUsers();
      setUsers(all);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <Screen scroll padded style={{ justifyContent: 'center' }}>
        <Text style={styles.loadingText}>Loading users…</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll padded onRefresh={loadUsers} refreshing={refreshing}>
      <ScreenHeader title="Users" subtitle={`${users.length} registered accounts`} />

      <View style={styles.listLabelRow}>
        <Text style={styles.listLabel}>Accounts</Text>
        <Text style={styles.listCount}>{users.length}</Text>
      </View>

      {users.length === 0 ? (
        <EmptyState glyph="👥" title="No users found" message="Registered accounts will appear here." />
      ) : (
        users.map((item) => {
          const meta = ROLE_META[item.role];
          return (
            <View style={styles.userCard} key={item.id}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.phone}>{item.phone}</Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: meta.soft, borderColor: meta.color }]}>
                <Text style={[styles.roleText, { color: meta.color }]}>{meta.label}</Text>
              </View>
            </View>
          );
        })
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
    ...theme.shadow.card,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: theme.colors.green },
  userInfo: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  email: { fontSize: 12, color: theme.colors.secondaryText, marginTop: 2, fontFamily: theme.fonts.mono },
  phone: { fontSize: 12, color: theme.colors.secondaryText, marginTop: 2 },
  roleBadge: { borderWidth: 1, borderRadius: theme.radius.sm, paddingHorizontal: 10, paddingVertical: 5 },
  roleText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  loadingText: { fontSize: 14, color: theme.colors.secondaryText, textAlign: 'center' },
});