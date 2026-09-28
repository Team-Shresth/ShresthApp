export type UserRole = 'shipment_user' | 'administrator';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  twofa_enabled: 0 | 1;
}

export type DeviceStatus = 'online' | 'offline' | 'maintenance';

export interface Device {
  id: number;
  serial_number: string;
  location: string;
  battery_pct: number;
  storage_pct: number;
  last_sync: string;
  status: DeviceStatus;
}

export type ShipmentStatus =
  | 'offline_recording'
  | 'in_transit'
  | 'verified_delivered'
  | 'tamper_detected'
  | 'live_breach';

export interface Shipment {
  id: number;
  batch_id: string;
  product_name: string;
  origin: string;
  destination: string;
  device_id: string;
  farmer_name: string;
  farmer_email: string;
  status: ShipmentStatus;
  created_at: string;
  delivered_at: string | null;
  total_value: number;
  estimated_co2_kg: number;
}

export interface Reading {
  id: number;
  device_id: string;
  batch_id: string;
  reading_index: number;
  timestamp: string;
  temperature_c: number;
  humidity_pct: number;
  ethylene_ppm: number;
  gps_lat: number;
  gps_lon: number;
  prev_hash: string;
  hash: string;
}

export interface CoreReadingFields {
  batch_id: string;
  device_id: string;
  reading_index: number;
  timestamp: string;
  temperature_c: number;
  humidity_pct: number;
  ethylene_ppm: number;
  gps_lat: number;
  gps_lon: number;
  hash: string;
  prev_hash?: string;
}

export interface ChainVerification {
  isTampered: boolean;
  tamperReadingIndex: number | null;
  expectedHash: string;
  storedHash: string;
  validCount: number;
}

export interface VerifyResult {
  type: 'verified' | 'tampered' | 'live_breach' | 'error';
  message: string;
  data?: {
    validCount?: number;
    totalCount?: number;
    expectedHash?: string;
    storedHash?: string;
    tamperReadingIndex?: number;
    tempDrift?: number;
    ethyleneDrift?: number;
  };
}

export type RootStackParamList = {
  Tabs: undefined;
  ShipmentDetail: { shipment: Shipment };
  PublicVerify: undefined;
};