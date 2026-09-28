import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

interface ScreenProps {
  children: React.ReactNode;
  /** Apply horizontal page padding + bottom inset padding */
  padded?: boolean;
  /** Wrap content in a ScrollView with pull-to-refresh support */
  scroll?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Wrap content in a KeyboardAvoidingView (non-scroll screens with inputs) */
  avoidKeyboard?: boolean;
  style?: ViewStyle;
}

export default function Screen({
  children,
  padded = false,
  scroll = false,
  onRefresh,
  refreshing,
  avoidKeyboard = false,
  style,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const contentStyle = [
    styles.content,
    padded && {
      paddingHorizontal: theme.spacing.page,
      paddingBottom: insets.bottom + theme.spacing.page,
    },
    style,
  ];

  if (scroll) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={!!refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.green}
                colors={[theme.colors.green]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  const body = <View style={[styles.flex, contentStyle]}>{children}</View>;

  if (avoidKeyboard) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {body}
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={[styles.root, styles.flex, { paddingTop: insets.top }]}>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
