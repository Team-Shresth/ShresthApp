import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { initDatabase, seedDatabase, isDatabaseEmpty } from './src/db/database';
import MainStack from './src/navigation/MainStack';
import AuthStack from './src/navigation/AuthStack';
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

  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
        const empty = await isDatabaseEmpty();
        if (empty) {
          await seedDatabase();
        }
      } catch (e) {
        console.error('DB init error:', e);
      } finally {
        setAuthReady(true);
      }
    })();
  }, []);

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
      {isAuthenticated ? (
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