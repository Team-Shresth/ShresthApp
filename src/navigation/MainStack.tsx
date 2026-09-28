import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import TabBar from './TabBar';

// --- User screens ---
import UserOverviewScreen from '../screens/user/OverviewScreen';
import UserMyShipmentsScreen from '../screens/user/MyShipmentsScreen';
import UserVerifyScreen from '../screens/user/VerifyScreen';
import UserShipmentDetailScreen from '../screens/user/ShipmentDetailScreen';

// --- Admin screens ---
import AdminOverviewScreen from '../screens/admin/OverviewScreen';
import AdminDevicesScreen from '../screens/admin/DevicesScreen';
import AdminShipmentsScreen from '../screens/admin/ShipmentsScreen';
import AdminAlertsScreen from '../screens/admin/AlertsScreen';
import AdminUsersScreen from '../screens/admin/UsersScreen';

// --- Public screens ---
import PublicVerifyScreen from '../screens/public/VerifyScreen';

import type { Shipment } from '../types';

export type RootStackParamList = {
  Tabs: undefined;
  ShipmentDetail: { shipment: Shipment };
  PublicVerify: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ---------------------------------------------------------------------------
// User tab navigator
// ---------------------------------------------------------------------------

const UserTab = createBottomTabNavigator();

export function UserTabs() {
  return (
    <UserTab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props: BottomTabBarProps) => <TabBar {...props} />}
    >
      <UserTab.Screen name="Overview" component={UserOverviewScreen} />
      <UserTab.Screen name="My Shipments" component={UserMyShipmentsScreen} />
      <UserTab.Screen name="Verify" component={UserVerifyScreen} />
    </UserTab.Navigator>
  );
}

// ---------------------------------------------------------------------------
// Admin tab navigator
// ---------------------------------------------------------------------------

const AdminTab = createBottomTabNavigator();

export function AdminTabs() {
  return (
    <AdminTab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props: BottomTabBarProps) => <TabBar {...props} />}
    >
      <AdminTab.Screen name="Overview" component={AdminOverviewScreen} />
      <AdminTab.Screen name="Devices" component={AdminDevicesScreen} />
      <AdminTab.Screen name="Shipments" component={AdminShipmentsScreen} />
      <AdminTab.Screen name="Alerts" component={AdminAlertsScreen} />
      <AdminTab.Screen name="Users" component={AdminUsersScreen} />
    </AdminTab.Navigator>
  );
}

// ---------------------------------------------------------------------------
// Main stack (wraps tabs + detail screens)
// ---------------------------------------------------------------------------

interface MainStackProps {
  authReady: boolean;
  user: { role?: string } | null;
}

export default function MainStack({ authReady, user }: MainStackProps) {
  if (!authReady) return null;

  const TabNavigator = user?.role === 'administrator' ? AdminTabs : UserTabs;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="ShipmentDetail" component={UserShipmentDetailScreen} />
      <Stack.Screen name="PublicVerify" component={PublicVerifyScreen} />
    </Stack.Navigator>
  );
}