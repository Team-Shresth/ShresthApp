# ShresthApp — Product Pitch

## One-liner

ShresthApp is a mobile cold-chain tracking app that lets supply-chain teams monitor shipments and devices in real time, and lets anyone verify a batch's integrity in seconds with a QR scan.

---

## The problem

Cold-chain shipments — produce, pharmaceuticals, perishables — lose value silently. Temperature excursions, ethylene buildup, and route deviations happen between checkpoints, and by the time someone notices, the batch is compromised. Existing tools are either enterprise-heavy, desktop-bound, or impossible for the end receiver to verify independently.

## The solution

A native mobile app with three role-based experiences:

| Role | What they get |
| --- | --- |
| **Administrator** | A fleet dashboard: device monitoring, shipment management, user administration, and live alerts for tamper detection and breaches |
| **Shipment user** | Their own consignments with detail screens, journey timelines, and temperature/ethylene trend charts |
| **Public verifier** | Anyone can scan a batch's QR code or enter its batch code and instantly see whether the chain of custody is intact |

### What makes it different

- **Verifiable by anyone** — cryptographic hash-chain verification (via `expo-crypto`) means the receiver doesn't have to trust the shipper's word; the math proves the readings weren't altered.
- **Stable QR identity** — each batch's QR is generated from its batch ID, so the code printed on the box stays valid for the life of the shipment.
- **Mobile-first, offline-capable** — a local SQLite data layer keeps the app responsive and functional without a constant connection.
- **Alerts that matter** — drift thresholds (temperature > 8, ethylene > 15) surface only real problems: `tamper_detected` and `live_breach`.

---

## Key capabilities

- Admin dashboard with fleet overview and status cards
- Device monitoring across the shipment fleet
- Shipment tracking with journey timeline and chart rendering
- Public batch verification via QR scan or batch code
- Hash-chain integrity verification of sensor readings
- Role-based authentication (administrator / shipment user)

## Technology

Built on a proven, production-ready stack:

- **React Native + Expo SDK 57** — one codebase, real native apps on Android and iOS
- **TypeScript** — type-safe from the database layer to the screens
- **React Navigation** — native-stack and bottom-tabs navigation
- **expo-sqlite** — local seeded data layer
- **expo-camera + expo-crypto** — QR scanning and cryptographic verification
- **EAS Build** — over-the-air-ready production builds for Play Store and App Store

## Current status

- ✅ All three role flows implemented and polished
- ✅ TypeScript compiles with no errors
- ✅ Expo dependency health check: 21/21 checks passed
- ✅ EAS build profiles configured (development / preview / production)
- ✅ Local seeded database with demo shipments, devices, and users

## Roadmap

1. **Backend integration** — replace the local SQLite layer with a cloud database for shared, multi-device data
2. **Live sensor ingestion** — stream readings from IoT devices instead of seeded data
3. **Push notifications** — real-time breach and tamper alerts
4. **Public deployment** — Play Store and App Store release via EAS

---

> ShresthApp: **track it, prove it, trust it.**
