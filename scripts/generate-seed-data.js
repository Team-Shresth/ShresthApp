const crypto = require('crypto');

const GENESIS = '0'.repeat(64);

function computeHash(fields, prevHash) {
  const sortedKeys = Object.keys(fields).sort();
  const sortedObj = {};
  for (const k of sortedKeys) sortedObj[k] = fields[k];
  return crypto.createHash('sha256').update(JSON.stringify(sortedObj) + prevHash).digest('hex');
}

function buildChain(baseTemp, count, opts = {}) {
  const readings = [];
  let prevHash = GENESIS;
  const startTs = opts.startTs || 1725000000000;
  const step = opts.step || 3600000;
  const drift = opts.drift || 0;
  for (let i = 0; i < count; i++) {
    const temp = baseTemp + drift * i + Math.sin(i / 2.3) * 0.4;
    const humidity = 82 - i * 0.15 + Math.cos(i / 3.1) * 0.6;
    const ethylene = opts.ethyleneBase ?? 12 + Math.sin(i / 3.7) * 2;
    const fields = {
      batch_id: opts.batchId,
      device_id: opts.deviceId,
      reading_index: i + 1,
      timestamp: new Date(startTs + i * step).toISOString(),
      temperature_c: Number(temp.toFixed(2)),
      humidity_pct: Number(humidity.toFixed(2)),
      ethylene_ppm: Number(ethylene.toFixed(1)),
      gps_lat: opts.lat,
      gps_lon: opts.lon,
    };
    const hash = computeHash(fields, prevHash);
    readings.push({ ...fields, prev_hash: prevHash, hash });
    prevHash = hash;
  }
  return readings;
}

const cleanMango = buildChain(16.8, 18, { batchId: 'BB-2381', deviceId: 'DEV-014', lat: 16.7632, lon: 74.7632, startTs: 1725000000000 });
const cleanTomato = buildChain(11.2, 14, { batchId: 'BB-2379', deviceId: 'DEV-009', lat: 20.0156, lon: 73.7925, startTs: 1725080000000 });
const cleanGreens = buildChain(4.2, 10, { batchId: 'BB-2390', deviceId: 'DEV-033', lat: 18.5204, lon: 73.8567, startTs: 1725160000000, drift: 0.62 });

// Tampered bananas: readings 1-9 valid, then 10-16 altered AFTER hashing
const tamperedBananas = buildChain(13.1, 16, { batchId: 'BB-2375', deviceId: 'DEV-021', lat: 21.1458, lon: 75.7973, startTs: 1725240000000 });
for (let i = 9; i < 16; i++) {
  const spike = i === 9 ? 22.4 : 13.4;
  tamperedBananas[i].temperature_c = spike;
  tamperedBananas[i].ethylene_ppm = 21.5;
}
// Note: hashes remain the ORIGINAL ones (post-hash tampering)

const data = {
  users: [
    { id: 1, name: 'Priya Menon', email: 'priya@freshmart.in', role: 'shipment_user', phone: '+91 98765 43210', twofa_enabled: 1 },
    { id: 2, name: 'Arvind Rao', email: 'arvind@freshmart.in', role: 'shipment_user', phone: '+91 98765 43211', twofa_enabled: 1 },
    { id: 3, name: 'Kavita Iyer', email: 'kavita@freshmart.in', role: 'shipment_user', phone: '+91 98765 43212', twofa_enabled: 1 },
    { id: 4, name: 'Rohan Deshmukh', email: 'rohan@shresth.gov.in', role: 'administrator', phone: '+91 98765 43213', twofa_enabled: 1 },
  ],
  devices: [
    { id: 1, serial_number: 'DEV-014', location: 'Ratnagiri-Mumbai corridor', battery_pct: 82, storage_pct: 61, last_sync: cleanMango[0].timestamp, status: 'online' },
    { id: 2, serial_number: 'DEV-009', location: 'Nashik-Pune corridor', battery_pct: 64, storage_pct: 48, last_sync: cleanTomato[0].timestamp, status: 'online' },
    { id: 3, serial_number: 'DEV-021', location: 'Jalgaon-Mumbai corridor', battery_pct: 37, storage_pct: 72, last_sync: tamperedBananas[0].timestamp, status: 'offline' },
    { id: 4, serial_number: 'DEV-033', location: 'Pune-Mumbai corridor', battery_pct: 91, storage_pct: 33, last_sync: cleanGreens[0].timestamp, status: 'online' },
  ],
  shipments: [
    { id: 1, batch_id: 'BB-2381', product_name: 'Alphonso Mangoes', origin: 'Ratnagiri', destination: 'Mumbai', device_id: 'DEV-014', farmer_name: 'Priya Menon', farmer_email: 'priya@freshmart.in', status: 'offline_recording', created_at: cleanMango[0].timestamp, delivered_at: null, total_value: 184000, estimated_co2_kg: 142 },
    { id: 2, batch_id: 'BB-2379', product_name: 'Roma Tomatoes', origin: 'Nashik', destination: 'Pune', device_id: 'DEV-009', farmer_name: 'Priya Menon', farmer_email: 'priya@freshmart.in', status: 'verified_delivered', created_at: cleanTomato[0].timestamp, delivered_at: cleanTomato[13].timestamp, total_value: 96000, estimated_co2_kg: 78 },
    { id: 3, batch_id: 'BB-2375', product_name: 'Cavendish Bananas', origin: 'Jalgaon', destination: 'Mumbai', device_id: 'DEV-021', farmer_name: 'Arvind Rao', farmer_email: 'arvind@freshmart.in', status: 'tamper_detected', created_at: tamperedBananas[0].timestamp, delivered_at: null, total_value: 128000, estimated_co2_kg: 105 },
    { id: 4, batch_id: 'BB-2390', product_name: 'Mixed Leafy Greens', origin: 'Pune', destination: 'Mumbai', device_id: 'DEV-033', farmer_name: 'Kavita Iyer', farmer_email: 'kavita@freshmart.in', status: 'live_breach', created_at: cleanGreens[0].timestamp, delivered_at: null, total_value: 74000, estimated_co2_kg: 56 },
  ],
  readings: { 'BB-2381': cleanMango, 'BB-2379': cleanTomato, 'BB-2375': tamperedBananas, 'BB-2390': cleanGreens },
};

require('fs').writeFileSync('seed-data.json', JSON.stringify(data, null, 2));
console.log('Seed data generated:', JSON.stringify({
  'BB-2381': cleanMango.length,
  'BB-2379': cleanTomato.length,
  'BB-2375': tamperedBananas.length,
  'BB-2390': cleanGreens.length,
}, null, 2));
