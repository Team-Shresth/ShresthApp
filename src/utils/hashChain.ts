import { digestStringAsync, CryptoDigestAlgorithm } from 'expo-crypto';
import type { CoreReadingFields } from '../types';

export type { CoreReadingFields } from '../types';

export async function computeHash(
  fields: Record<string, any>,
  prevHash: string,
): Promise<string> {
  const CORE_FIELDS: (keyof CoreReadingFields)[] = [
    'batch_id',
    'device_id',
    'reading_index',
    'timestamp',
    'temperature_c',
    'humidity_pct',
    'ethylene_ppm',
    'gps_lat',
    'gps_lon',
  ];

  const sortedKeys = [...CORE_FIELDS].sort();
  const sortedObj: Record<string, unknown> = {};
  for (const k of sortedKeys) {
    sortedObj[k] = fields[k];
  }
  const payload = JSON.stringify(sortedObj) + prevHash;
  return digestStringAsync(CryptoDigestAlgorithm.SHA256, payload);
}

export async function verifyChain(
  readings: CoreReadingFields[],
): Promise<{
  isTampered: boolean;
  tamperReadingIndex: number | null;
  expectedHash: string;
  storedHash: string;
  validCount: number;
}> {
  let prevHash = '0'.repeat(64); // genesis prev hash
  let validCount = 0;
  for (const r of readings) {
    const expected = await computeHash(r, prevHash);
    const readingHash = r.hash || '';
    if (expected.toLowerCase() !== readingHash.toLowerCase()) {
      return {
        isTampered: true,
        tamperReadingIndex: r.reading_index,
        expectedHash: expected,
        storedHash: readingHash,
        validCount,
      };
    }
    prevHash = readingHash;
    validCount++;
  }
  return { isTampered: false, tamperReadingIndex: null, expectedHash: '', storedHash: '', validCount };
}