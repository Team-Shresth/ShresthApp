# ShresthApp

A React Native (Expo) mobile application for cold-chain shipment tracking and supply-chain traceability. ShresthApp supports admin, user, and public verification workflows for batches, shipments, device monitoring, and integrity checks. Administrators monitor devices and shipments, users track their consignments, and anyone can verify batch integrity with a batch code or QR scan.

## Features

- **Admin dashboard** — fleet overview, device monitoring, shipment management, and alerts
- **Shipment tracking** — detail screens with journey timeline and temperature/ethylene charts
- **Public verification** — verify batch integrity via batch code or QR scan
- **Hash-chain integrity** — cryptographic verification of reading chains using `expo-crypto`
- **QR verification links** — shipment QR codes open the public verification page and load the batch automatically
- **Tamper details** — show the affected reading, timestamp, GPS coordinates, device, sensor values, and hash comparison
- **Account controls** — user/admin profile menu with role details, settings entry, sign out, and light/dark mode
- **Local data layer** — SQLite database seeded with demo data via `expo-sqlite`
- **Role-based flows** — administrator, shipment user, and public verification roles

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React Native 0.86, Expo SDK 57, React 19 |
| Language | TypeScript |
| Navigation | React Navigation (`native-stack` + `bottom-tabs`) |
| Data | `expo-sqlite` (local seeded database) |
| Device / Crypto | `expo-camera` (QR scanning), `expo-crypto` (hash chain) |
| UI | Custom StyleSheet theme system, `react-native-svg`, `react-native-qrcode-svg` |
| Build | Expo CLI, EAS Build, Metro bundler |

## Project Structure

```
ShresthApp/
├── app.json              # Expo configuration
├── App.tsx               # Root component
├── index.ts              # Entry point
├── eas.json              # EAS Build configuration
├── seed-data.json        # Demo data for the local database
├── scripts/
│   └── generate-seed-data.js
└── src/
    ├── components/       # Reusable UI components (Button, Card, QRCode, ...)
    ├── constants/        # Centralized theme tokens
    ├── context/          # AuthContext (authentication state)
    ├── db/               # SQLite database setup and queries
    ├── navigation/       # Navigators and custom tab bar
    ├── screens/          # admin / auth / public / user screens
    ├── types/            # Shared TypeScript types
    └── utils/            # Hash-chain verification logic
```

## Getting Started

### Prerequisites

- Node.js (LTS)
- npm
- Expo Go app on a physical device, or an Android emulator / iOS simulator

### Install and run

Run all commands from the actual app folder (the inner `ShresthApp` directory):

```powershell
npm install
npx expo start
```

Then scan the QR code in the terminal with the Expo Go app, or press `a` / `i` to launch on an emulator/simulator.

### Web preview

Build and serve the web export locally:

```powershell
npm run build:web
npx serve dist
```

The live web demo is available at [https://shresth-app.vercel.app](https://shresth-app.vercel.app).

### Demo accounts

- Shipment user: `priya@freshmart.in`
- Administrator: `rohan@shresth.gov.in`
- Demo password: any value

Both accounts use a generated six-digit demo OTP shown on the verification screen.

### QR verification

QR codes generated for batches encode a public URL such as:

```text
https://shresth-app.vercel.app/?batch=BB-2375
```

Scanning a newly generated QR with Google Lens opens the public verification page and displays the shipment result. For tampered shipments, the result includes the tamper reading number, date/time, GPS location, device ID, sensor values, valid reading count, and expected/stored/previous/reading hashes.

> **Note:** The demo currently uses a local seeded SQLite database. It is suitable for demonstrations, but data is not shared between users or devices. A production deployment needs a shared backend database and authentication service.

## Key Files

- [`src/db/database.ts`](src/db/database.ts) — SQLite database setup and data loading
- [`src/utils/hashChain.ts`](src/utils/hashChain.ts) — verification logic for chain integrity
- [`src/constants/theme.ts`](src/constants/theme.ts) — centralized UI theme
- [`src/navigation/MainStack.tsx`](src/navigation/MainStack.tsx) — top-level navigation config
- [`src/context/AuthContext.tsx`](src/context/AuthContext.tsx) — authentication state
- [`src/screens/public/VerifyScreen.tsx`](src/screens/public/VerifyScreen.tsx) — public verification flow

## Deployment

The project is configured for [Expo EAS](https://expo.dev/eas) production builds via [`eas.json`](eas.json):

- **development** — internal distribution with the development client
- **preview** — internal distribution for testing
- **production** — Play Store / App Store distribution with auto-incremented build numbers

See [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md) for the full release checklist.

## License

This project is licensed under the terms found in [`LICENSE`](LICENSE).
