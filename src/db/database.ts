import * as SQLite from 'expo-sqlite';
import { User, Device, Shipment, Reading } from '../types';
import seedData from '../../seed-data.json';

// Expo SDK 57 uses openDatabaseAsync (the legacy openDatabase callback API is removed)
let _db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync('shresth_traceability.db');
  }
  return _db;
}

export async function initDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      phone TEXT,
      twofa_enabled INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serial_number TEXT UNIQUE NOT NULL,
      location TEXT,
      battery_pct REAL,
      storage_pct REAL,
      last_sync TEXT,
      status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS shipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id TEXT UNIQUE NOT NULL,
      product_name TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      device_id TEXT NOT NULL,
      farmer_name TEXT NOT NULL,
      farmer_email TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT,
      delivered_at TEXT,
      total_value REAL,
      estimated_co2_kg REAL
    );
    CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      batch_id TEXT NOT NULL,
      reading_index INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      temperature_c REAL NOT NULL,
      humidity_pct REAL NOT NULL,
      ethylene_ppm REAL NOT NULL,
      gps_lat REAL,
      gps_lon REAL,
      prev_hash TEXT NOT NULL,
      hash TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_readings_batch ON readings(batch_id);
    CREATE INDEX IF NOT EXISTS idx_readings_hash ON readings(hash);
  `);
}

export async function isDatabaseEmpty(): Promise<boolean> {
  const db = await getDb();
  const result = await db.getFirstAsync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM shipments;');
  return (result?.cnt ?? 0) === 0;
}

export async function seedDatabase(): Promise<void> {
  const s = seedData as {
    users: Omit<User, 'id'>[];
    devices: Omit<Device, 'id'>[];
    shipments: Omit<Shipment, 'id'>[];
    readings: Record<string, Omit<Reading, 'id'>[]>;
  };

  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const u of s.users) {
      await db.runAsync(
        'INSERT INTO users (name, email, role, phone, twofa_enabled) VALUES (?,?,?,?,?);',
        [u.name, u.email, u.role, u.phone, u.twofa_enabled]
      );
    }
    for (const d of s.devices) {
      await db.runAsync(
        'INSERT INTO devices (serial_number, location, battery_pct, storage_pct, last_sync, status) VALUES (?,?,?,?,?,?);',
        [d.serial_number, d.location, d.battery_pct, d.storage_pct, d.last_sync, d.status]
      );
    }
    for (const sh of s.shipments) {
      await db.runAsync(
        'INSERT INTO shipments (batch_id, product_name, origin, destination, device_id, farmer_name, farmer_email, status, created_at, delivered_at, total_value, estimated_co2_kg) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);',
        [sh.batch_id, sh.product_name, sh.origin, sh.destination, sh.device_id, sh.farmer_name, sh.farmer_email, sh.status, sh.created_at, sh.delivered_at, sh.total_value, sh.estimated_co2_kg]
      );
    }
    for (const batchId of Object.keys(s.readings)) {
      for (const r of s.readings[batchId]) {
        await db.runAsync(
          'INSERT INTO readings (device_id, batch_id, reading_index, timestamp, temperature_c, humidity_pct, ethylene_ppm, gps_lat, gps_lon, prev_hash, hash) VALUES (?,?,?,?,?,?,?,?,?,?,?);',
          [r.device_id, r.batch_id, r.reading_index, r.timestamp, r.temperature_c, r.humidity_pct, r.ethylene_ppm, r.gps_lat, r.gps_lon, r.prev_hash, r.hash]
        );
      }
    }
  });
  console.log('Seed data inserted successfully');
}

export async function getShipments(): Promise<Shipment[]> {
  const db = await getDb();
  return db.getAllAsync<Shipment>('SELECT * FROM shipments ORDER BY created_at DESC;');
}

export async function getShipmentByBatchId(batchId: string): Promise<Shipment | null> {
  const db = await getDb();
  return db.getFirstAsync<Shipment>('SELECT * FROM shipments WHERE batch_id = ?;', [batchId]);
}

export async function getReadingsByBatchId(batchId: string): Promise<Reading[]> {
  const db = await getDb();
  return db.getAllAsync<Reading>(
    'SELECT * FROM readings WHERE batch_id = ? ORDER BY reading_index ASC;',
    [batchId]
  );
}

export async function getAllReadings(): Promise<Reading[]> {
  const db = await getDb();
  return db.getAllAsync<Reading>('SELECT * FROM readings ORDER BY batch_id, reading_index;');
}

export async function getUsers(): Promise<User[]> {
  const db = await getDb();
  return db.getAllAsync<User>('SELECT * FROM users;');
}

export async function getDevices(): Promise<Device[]> {
  const db = await getDb();
  return db.getAllAsync<Device>('SELECT * FROM devices;');
}
