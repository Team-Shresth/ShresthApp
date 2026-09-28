# ShresthApp Project Documentation

## Overview
ShresthApp is a React Native Expo application for supply-chain and traceability workflows. It supports admin, user, and public verification flows for batches, shipments, device monitoring, and integrity checks.

## Project Purpose
The app is designed to:
- track shipment and device status
- verify batch integrity using hash-chain logic
- monitor temperature, ethylene, and route activity
- support admin overview and shipment operations
- allow public verification with batch codes and QR scanning

## Tech Stack

### Frontend
- React Native
- Expo SDK 57
- TypeScript
- React

### Navigation
- @react-navigation/native
- @react-navigation/native-stack
- @react-navigation/bottom-tabs

### Data and Storage
- expo-sqlite
- local SQLite database seeded with demo data

### UI and Styling
- React Native StyleSheet
- custom theme tokens
- reusable components for cards, buttons, inputs, status badges, charts, and QR
- react-native-svg
- react-native-qrcode-svg

### Extras
- expo-camera
- expo-crypto
- expo-font
- react-native-safe-area-context
- react-native-screens
- react-native-reanimated
- nativewind
- tailwindcss

## Project Structure

- app.json
- App.tsx
- index.ts
- package.json
- eas.json
- src/
  - components/
  - constants/
  - context/
  - db/
  - navigation/
  - screens/
  - types/
  - utils/

## Core Features
- Admin dashboard with fleet overview
- Device monitoring and status cards
- Shipment tracking and detail screens
- User shipment overview
- Public batch verification
- Hash-chain integrity verification
- QR code generation
- Journey timeline and chart rendering

## Key Files
- [src/db/database.ts](src/db/database.ts): SQLite database setup and data loading
- [src/utils/hashChain.ts](src/utils/hashChain.ts): verification logic for chain integrity
- [src/constants/theme.ts](src/constants/theme.ts): centralized UI theme
- [src/navigation/MainStack.tsx](src/navigation/MainStack.tsx): top-level navigation config
- [src/context/AuthContext.tsx](src/context/AuthContext.tsx): authentication state
- [src/screens/public/VerifyScreen.tsx](src/screens/public/VerifyScreen.tsx): public verification flow

## Important Notes
- This is a native mobile app, not a plain static HTML website.
- The app is designed for Expo Go, Android emulator, iOS simulator, or EAS-based production builds.
- Web preview is not the primary or recommended approach because the project uses SQLite and native mobile dependencies that do not work reliably in browser mode.
- The project root must be the actual app folder when running Expo commands.

## Correct Local Run Command
```powershell
cmd /d /c "cd /d ""C:\Users\User\OneDrive\Desktop\ShresthApp\ShresthApp"" && npx expo start"
```

## Production Deployment Recommendation
Use Expo EAS for real-world deployment:
- Android internal or play store distribution
- iOS App Store distribution
- device-based deployment outside localhost

## Verification Status
The project is verified to pass Expo dependency checks:
- npx expo-doctor
- Result: 21/21 checks passed

## Notes for Future Work
- Replace local SQLite with a backend database for cloud deployment if a web/public deployment is required.
- Keep the app mobile-first and native-focused for production use.
- Use EAS builds for production release rather than relying on local dev servers.
