import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const ICON = 22;

type IconName =
  | 'overview'
  | 'box'
  | 'shield'
  | 'device'
  | 'truck'
  | 'alert'
  | 'users'
  | 'circle';

function TabIcon({ name, color }: { name: IconName; color: string }) {
  const s = {
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  switch (name) {
    case 'overview':
      return (
        <Svg width={ICON} height={ICON} viewBox="0 0 24 24">
          <Rect x="3.5" y="3.5" width="7" height="7" rx="1.5" {...s} />
          <Rect x="13.5" y="3.5" width="7" height="7" rx="1.5" {...s} />
          <Rect x="3.5" y="13.5" width="7" height="7" rx="1.5" {...s} />
          <Rect x="13.5" y="13.5" width="7" height="7" rx="1.5" {...s} />
        </Svg>
      );
    case 'box':
      return (
        <Svg width={ICON} height={ICON} viewBox="0 0 24 24">
          <Path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" {...s} />
          <Path d="M4 7.5l8 4.5 8-4.5" {...s} />
          <Path d="M12 12v9" {...s} />
        </Svg>
      );
    case 'shield':
      return (
        <Svg width={ICON} height={ICON} viewBox="0 0 24 24">
          <Path d="M12 3l7 3v5c0 4.4-2.9 8.4-7 10-4.1-1.6-7-5.6-7-10V6l7-3z" {...s} />
          <Path d="M9 11.5l2 2 4-4" {...s} />
        </Svg>
      );
    case 'device':
      return (
        <Svg width={ICON} height={ICON} viewBox="0 0 24 24">
          <Rect x="7" y="6.5" width="10" height="11" rx="2" {...s} />
          <Path d="M10 3.5v3M14 3.5v3M10 17.5v3M14 17.5v3M4 10.5h3M4 13.5h3M17 10.5h3M17 13.5h3" {...s} />
        </Svg>
      );
    case 'truck':
      return (
        <Svg width={ICON} height={ICON} viewBox="0 0 24 24">
          <Path d="M2.5 6.5h11v9h-11z" {...s} />
          <Path d="M13.5 10h4l3 3.5v2.5h-7" {...s} />
          <Circle cx="7" cy="17.5" r="1.8" {...s} />
          <Circle cx="17" cy="17.5" r="1.8" {...s} />
        </Svg>
      );
    case 'alert':
      return (
        <Svg width={ICON} height={ICON} viewBox="0 0 24 24">
          <Path d="M12 4.5L21 19H3L12 4.5z" {...s} />
          <Path d="M12 10v4" {...s} />
          <Circle cx="12" cy="16.4" r="0.5" fill={color} stroke="none" />
        </Svg>
      );
    case 'users':
      return (
        <Svg width={ICON} height={ICON} viewBox="0 0 24 24">
          <Circle cx="9" cy="8.5" r="3.2" {...s} />
          <Path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" {...s} />
          <Path d="M15.5 5.8a3.2 3.2 0 010 5.4M17.5 14.4c1.8.7 3 2.3 3 4.6" {...s} />
        </Svg>
      );
    default:
      return (
        <Svg width={ICON} height={ICON} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="8" {...s} />
        </Svg>
      );
  }
}

const TAB_META: Record<string, { icon: IconName; label: string }> = {
  Overview: { icon: 'overview', label: 'Overview' },
  'My Shipments': { icon: 'box', label: 'Shipments' },
  Verify: { icon: 'shield', label: 'Verify' },
  Devices: { icon: 'device', label: 'Devices' },
  Shipments: { icon: 'truck', label: 'Shipments' },
  Alerts: { icon: 'alert', label: 'Alerts' },
  Users: { icon: 'users', label: 'Users' },
};

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, theme.spacing.sm) }]}>
      {state.routes.map((route, idx) => {
        const meta = TAB_META[route.name] ?? { icon: 'circle' as IconName, label: route.name };
        const isFocused = state.index === idx;
        const color = isFocused ? theme.colors.green : theme.colors.mutedText;

        return (
          <TouchableOpacity
            key={route.key}
            style={[styles.tabItem, isFocused && styles.tabItemFocused]}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            <TabIcon name={meta.icon} color={color} />
            <Text style={[styles.tabLabel, { color }, isFocused && styles.tabLabelFocused]}>
              {meta.label}
            </Text>
            <View style={[styles.tabDot, isFocused && { backgroundColor: theme.colors.green }]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: theme.radius.md,
    paddingVertical: 6,
    marginHorizontal: 2,
  },
  tabItemFocused: {
    backgroundColor: theme.colors.greenSoft,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tabLabelFocused: {
    fontWeight: '700',
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
});
