import React, { createContext, useContext, useState, useCallback } from 'react';
import { getRandomBytes } from 'expo-crypto';
import { User } from '../types';
import { getUsers } from '../db/database';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: string) => Promise<{ requiresOtp: boolean; userId: string }>;
  verifyOtp: (userId: string, code: string) => Promise<boolean>;
  logout: () => void;
  otpCode: string | null;
  otpUserId: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => ({ requiresOtp: false, userId: '' }),
  verifyOtp: async () => false,
  logout: () => {},
  otpCode: null,
  otpUserId: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const [otpUserId, setOtpUserId] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string, role: string) => {
    const users = await getUsers();
    const matched = users.find(u => u.email === email && u.role === role);
    if (!matched) throw new Error('Invalid credentials or role');
    // For production: verify password hash here
    // For demo: accept any password for seeded users
    const code = await generateSecureOTP();
    setOtpCode(code);
    setOtpUserId(String(matched.id));
    return { requiresOtp: true, userId: String(matched.id) };
  }, []);

  const verifyOtp = useCallback(async (_userId: string, code: string) => {
    if (!otpCode || code !== otpCode) return false;
    const users = await getUsers();
    const u = users.find(x => String(x.id) === _userId) || null;
    setUser(u);
    setOtpCode(null);
    setOtpUserId(null);
    return true;
  }, [otpCode]);

  const logout = useCallback(() => {
    setUser(null);
    setOtpCode(null);
    setOtpUserId(null);
  }, []);

  const generateSecureOTP = useCallback(async () => {
    // Generate 6-digit OTP using cryptographically secure random
    const bytes = await getRandomBytes(3);
    let value = 0;
    for (let i = 0; i < 3; i++) {
      value = (value << 8) | bytes[i];
    }
    // Map to 6-digit range (0-999999)
    const otp = Math.abs(value) % 1000000;
    return String(otp).padStart(6, '0');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, verifyOtp, logout, otpCode, otpUserId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}