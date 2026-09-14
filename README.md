# NavGuard

NavGuard is a resilient vehicle navigation prototype built with React Native and Expo. It is designed to keep navigation usable during GNSS outages, jamming, and tunnel blackouts by simulating AI-assisted dead reckoning and sensor-based fallback logic.

This project focuses on making navigation more robust in real-world conditions where traditional GPS can become unreliable.

## Why this project exists

Modern navigation systems depend heavily on GNSS signals. In dense urban canyons, tunnels, underground routes, or environments affected by signal interference, location confidence can drop suddenly. NavGuard explores a safer fallback model using inertial and sensor-driven dead reckoning to maintain continuity during outages.

## Core features

- GNSS signal monitoring and resilience simulation
- AI + INS dead reckoning fallback behavior
- Live route and navigation dashboard
- Vehicle telemetry and outage visualization
- Turn-by-turn guidance experience
- Trip diagnostics and post-drive summary
- Mobile-first interface optimized for in-vehicle use

## Tech stack

- React Native
- Expo
- TypeScript
- React Navigation
- Expo Location / Sensors
- SVG-based UI visualization
- Material-inspired design system

## App flow

The app presents a modern navigation dashboard with:

- map and route visualization
- system health indicators
- outage simulation and warning states
- telemetry cards for motion and drift
- trip summary and diagnostics views

## Getting started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio / emulator or iOS simulator (optional)

### Install dependencies

```bash
npm install
```

### Start the app

```bash
npx expo start
```

### Run in a browser

```bash
npx expo start --web
```

### Run on Android / iOS

```bash
npx expo start --android
npx expo start --ios
```

## Project structure

```text
navguard-app/
├── App.tsx
├── index.ts
├── app.json
├── package.json
├── tsconfig.json
├── assets/
├── src/
│   ├── components/
│   ├── context/
│   ├── navigation/
│   ├── screens/
│   ├── theme/
│   └── ...
└── README.md
```

## Notes

This is a prototype and demonstration app focused on resilient navigation UX and simulation rather than production-grade automotive deployment.

## License

This project is currently unlicensed unless you add a license file for public GitHub use.

If you want, I can also help you add a proper MIT license and a cleaner GitHub-ready badges section.
