import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import OTPScreen from '../screens/auth/OTPScreen';

export type AuthStackParamList = {
  Login: undefined;
  OTP: { userId: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  const { verifyOtp, otpCode } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP">
        {(props) => (
          <OTPScreen
            {...props}
            route={{
              ...props.route,
              params: {
                ...props.route.params,
                onVerify: verifyOtp,
                otpCode: otpCode ?? '',
              },
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}