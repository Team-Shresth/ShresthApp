import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { initDatabase, seedDatabase, isDatabaseEmpty } from './src/db/database';
import MainStack from './src/navigation/MainStack';
import AuthStack from './src/navigation/AuthStack';
import PublicVerifyScreen from './src/screens/public/VerifyScreen';
import { theme } from './src/constants/theme';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppInner />
      </NavigationContainer>
    </AuthProvider>
  );
}

function AppInner() {
  const { isAuthenticated, user } = useAuth();
  const [authReady, setAuthReady] = useState(false);
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const publicBatchId = Platform.OS === 'web' && typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('batch')?.toUpperCase()
    : undefined;

  useEffect(() => {
    let active = true;
    let releaseDatabaseLock: (() => void) | undefined;

    const initializeDatabase = async () => {
      await initDatabase();
      const empty = await isDatabaseEmpty();
      if (empty) await seedDatabase();
      if (active) setAuthReady(true);
    };

    const handleDatabaseError = (error: unknown) => {
      console.error('DB init error:', error);
      if (active) {
        setDatabaseError('The local database could not be opened. Close other app tabs, then reload.');
      }
    };

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && 'locks' in navigator) {
      void navigator.locks.request(
        'shresthapp-sqlite-database',
        { ifAvailable: true },
        async (lock) => {
          if (!lock) {
            if (active) {
              setDatabaseError('ShresthApp is already open in another tab. Close that tab, then reload.');
            }
            return;
          }

          try {
            await initializeDatabase();
            await new Promise<void>((resolve) => {
              releaseDatabaseLock = resolve;
            });
          } catch (error) {
            handleDatabaseError(error);
          }
        },
      ).catch(handleDatabaseError);
    } else {
      void initializeDatabase().catch(handleDatabaseError);
    }

    return () => {
      active = false;
      releaseDatabaseLock?.();
    };
  }, []);

  if (databaseError) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingTitle}>Database unavailable</Text>
        <Text style={styles.loadingSub}>{databaseError}</Text>
      </View>
    );
  }

  if (!authReady) {
    return (
      <View style={styles.loading}>
        <StatusBar style="dark" />
        <View style={styles.mark}>
          <Text style={styles.markText}>S</Text>
        </View>
        <Text style={styles.loadingTitle}>Shresth</Text>
        <Text style={styles.loadingSub}>Farm-to-Fork Cold Chain Traceability</Text>
        <ActivityIndicator color={theme.colors.green} style={styles.spinner} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      {publicBatchId ? (
        <PublicVerifyScreen initialBatchId={publicBatchId} />
      ) : isAuthenticated ? (
        <MainStack authReady={true} user={user} />
      ) : (
        <AuthStack />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.page,
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.greenSoft,
    borderWidth: 1,
    borderColor: theme.colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.gap,
  },
  markText: { fontSize: 28, fontWeight: '700', color: theme.colors.green },
  loadingTitle: { fontSize: 24, fontWeight: '700', color: theme.colors.text, letterSpacing: -0.4 },
  loadingSub: { color: theme.colors.secondaryText, marginTop: 6, fontSize: 13, textAlign: 'center' },
  spinner: { marginTop: theme.spacing.section },
});