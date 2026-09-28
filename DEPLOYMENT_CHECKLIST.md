# ShresthApp Deployment Checklist

A step-by-step checklist for taking ShresthApp from local development to a production release using Expo EAS.

---

## 1. Pre-release verification

- [ ] Run the TypeScript compiler with no errors:
  ```powershell
  npx tsc --noEmit
  ```
- [ ] Run the Expo dependency health check:
  ```powershell
  npx expo-doctor
  ```
  Target: all checks pass (current baseline: 21/21).
- [ ] Confirm the app runs cleanly in development mode from the correct project folder:
  ```powershell
  cmd /d /c "cd /d ""C:\Users\User\OneDrive\Desktop\ShresthApp\ShresthApp"" && npx expo start"
  ```
- [ ] Smoke-test every role flow on a real device or emulator:
  - [ ] Admin: overview, devices, shipments, users, alerts
  - [ ] User: overview, my shipments, shipment detail, verify
  - [ ] Public: batch verification via code and QR scan
- [ ] Verify QR payloads are stable (generated from batch IDs, e.g. `BB-2375`).
- [ ] Verify hash-chain integrity checks pass on seeded batches.

## 2. App configuration

- [ ] Confirm [`app.json`](app.json) fields are correct:
  - [ ] `name` and `slug` (`ShresthApp`)
  - [ ] `version` (currently `1.0.0`)
  - [ ] `orientation: portrait`
  - [ ] `icon` and Android adaptive icon assets exist in `assets/`
- [ ] Confirm [`eas.json`](eas.json) build profiles:
  - [ ] `development` — internal distribution, development client
  - [ ] `preview` — internal distribution
  - [ ] `production` — production channel, `autoIncrement: true`
- [ ] Decide whether to bump `version` in `app.json` and `package.json` for the release.

## 3. EAS account and project setup

- [ ] Install or update the EAS CLI:
  ```powershell
  npm install -g eas-cli
  ```
- [ ] Log in to your Expo account:
  ```powershell
  eas login
  ```
- [ ] Initialize/link the EAS project (if not already linked):
  ```powershell
  eas init
  ```
- [ ] Confirm the project ID is written to `app.json` → `expo.extra.eas.projectId`.

## 4. Build

- [ ] Create a preview build for internal testing:
  ```powershell
  eas build --profile preview --platform android
  ```
- [ ] Install the preview build on a test device and repeat the smoke tests from step 1.
- [ ] Create the production build:
  ```powershell
  eas build --profile production --platform android
  eas build --profile production --platform ios
  ```
- [ ] Confirm build numbers auto-incremented and the builds appear on the Expo dashboard.

## 5. Store submission

- [ ] Prepare store listings:
  - [ ] App name, description, screenshots, feature graphic
  - [ ] Privacy policy URL
  - [ ] Camera permission justification (QR scanning)
- [ ] Submit to the Play Store:
  ```powershell
  eas submit --platform android --latest
  ```
- [ ] Submit to the App Store:
  ```powershell
  eas submit --platform ios --latest
  ```
- [ ] Complete store review requirements and release.

## 6. Post-release

- [ ] Tag the release in version control (e.g. `v1.0.0`).
- [ ] Monitor crashes and feedback via the Expo dashboard / store consoles.
- [ ] Plan future work:
  - Replace local SQLite with a backend database if cloud/web deployment is required.
  - Keep the app mobile-first and native-focused for production use.
  - Use EAS builds for production releases rather than local dev servers.

---

> **Note:** The app currently uses a local seeded SQLite database. For a true cloud deployment with shared data, a backend service must be added first — see [`PROJECT_DOC.md`](PROJECT_DOC.md).
