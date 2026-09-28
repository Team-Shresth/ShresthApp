# ShresthApp

A React Native (Expo) mobile application for cold-chain shipment tracking and supply-chain traceability. ShresthApp supports admin, user, and public verification workflows for batches, shipments, device monitoring, and integrity checks. Administrators monitor devices and shipments, users track their consignments, and anyone can verify batch integrity with a batch code or QR scan.

## Features

- **Admin dashboard** — fleet overview, device monitoring, shipment management, and alerts
- **Shipment tracking** — detail screens with journey timeline and temperature/ethylene charts
- **Public verification** — verify batch integrity via batch code or QR scan
- **Hash-chain integrity** — cryptographic verification of reading chains using `expo-crypto`
- **QR code generation** — stable QR payloads generated from batch IDs
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

> **Note:** This is a native mobile app, not a static website. Web preview is not the primary approach because the project uses SQLite and native mobile dependencies that do not work reliably in browser mode.

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
