import { useState, useCallback } from 'react';
import { getShipmentByBatchId, getReadingsByBatchId } from '../db/database';
import { verifyChain } from '../utils/hashChain';
import type { CoreReadingFields, VerifyResult } from '../types';

export type { VerifyResult };

export function useVerifyShipment() {
  const [verifying, setVerifying] = useState(false);

  const verify = useCallback(async (batchId: string): Promise<VerifyResult> => {
    setVerifying(true);
    try {
      const shipment = await getShipmentByBatchId(batchId);
      if (!shipment) return { type: 'error', message: 'Batch not found' };

      const readings = await getReadingsByBatchId(batchId);
      if (readings.length === 0) return { type: 'error', message: 'No readings found for this batch' };

      const coreReadings: CoreReadingFields[] = readings.map(r => ({
        batch_id: r.batch_id,
        device_id: r.device_id,
        reading_index: r.reading_index,
        timestamp: r.timestamp,
        temperature_c: r.temperature_c,
        humidity_pct: r.humidity_pct,
        ethylene_ppm: r.ethylene_ppm,
        gps_lat: r.gps_lat,
        gps_lon: r.gps_lon,
        hash: r.hash,
        prev_hash: r.prev_hash,
      }));

      const result = await verifyChain(coreReadings);
      if (result.isTampered) {
        return {
          type: 'tampered',
          message: `Tamper detected at reading ${result.tamperReadingIndex}`,
          data: {
            validCount: result.validCount,
            totalCount: readings.length,
            expectedHash: result.expectedHash,
            storedHash: result.storedHash,
            tamperReadingIndex: result.tamperReadingIndex ?? undefined,
            tamperedReading: readings.find((reading) => reading.reading_index === result.tamperReadingIndex),
            shipment,
          },
        };
      }

      const temps = readings.map(r => r.temperature_c);
      const ethylene = readings.map(r => r.ethylene_ppm);
      const tempDrift = Math.max(...temps) - Math.min(...temps);
      const ethyleneDrift = Math.max(...ethylene) - Math.min(...ethylene);
      if (tempDrift > 8 || ethyleneDrift > 15) {
        return { type: 'live_breach', message: 'Live breach detected: environmental parameters drifted beyond safe thresholds', data: { tempDrift, ethyleneDrift, shipment } };
      }

      return { type: 'verified', message: 'Verified: hash chain intact and environmental parameters within normal ranges', data: { validCount: readings.length, totalCount: readings.length, shipment } };
    } catch (e: any) {
      return { type: 'error', message: e.message || 'Verification failed' };
    } finally {
      setVerifying(false);
    }
  }, []);

  return { verify, verifying };
}