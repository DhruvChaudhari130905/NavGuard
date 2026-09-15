# 🛡️ NavGuard — Resilient Vehicle Navigation System

[![Expo](https://img.shields.io/badge/Expo-v57.0.0-blue.svg?logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-v0.86.3-61DAFB.svg?logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.x-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-orange.svg)](#getting-started)

> **NavGuard** is an intelligent, fail-safe vehicle navigation application engineered to ensure navigation continuity in GNSS-denied, jammed, spoofed, and tunnel blackout environments using **AI-assisted Dead Reckoning (AI/INS)** and multi-sensor fusion.

---

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Interactive Demo & Outage Simulation](#-interactive-demo--outage-simulation)
- [Screens & User Experience](#-screens--user-experience)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Running the Demo](#-running-the-demo)
- [Verification & Quality Checks](#-verification--quality-checks)
- [Roadmap & Future Work](#-roadmap--future-work)
- [License](#-license)

---

## 🚨 The Problem

Modern transportation, logistics fleets, and emergency vehicles rely almost entirely on Global Navigation Satellite Systems (**GNSS** like GPS, NavIC, Galileo, GLONASS). However, satellite signals are intrinsically weak and susceptible to:

- **Urban Canyons & High-Rise Multipath**: Reflections off skyscrapers lead to massive position errors.
- **Tunnels & Underground Infrastructure**: Instantaneous loss of satellite line-of-sight.
- **Electronic Warfare & Jamming**: Low-cost RF jammers can drown out satellite signals across entire sectors.
- **GPS Spoofing**: Adversarial actors transmitting fake satellite signals to veer vehicles off course.

A sudden dropout at high speeds creates critical safety hazards, route disorientation, and mission failure.

---

## 💡 The Solution

**NavGuard** provides a dual-layer navigation pipeline:

1. **Primary Layer (GNSS Optimal)**: Tracks satellite health, carrier-to-noise ratio, and satellite count. In optimal conditions, high-precision GNSS drives mapping and routing.
2. **Resilience Layer (AI + INS Dead Reckoning)**: Upon detecting signal degradation or outage, NavGuard autonomously switches to **Inertial Navigation System (INS)** Dead Reckoning. By fusing 3-axis accelerometer and 3-axis gyroscope data with vehicle kinematics and learned motion models, it estimates vehicle trajectory, heading, and velocity with minimal drift until GNSS signal recovery.

```
+----------------------------------------------------------------+
|                    Environmental GNSS Signals                  |
+-------------------------------+--------------------------------+
                                |
                                v
               +----------------------------------+
               |   Signal Health & Outage Monitor |
               +----------------+-----------------+
                                |
       +------------------------+------------------------+
       | [Signal OK]                                     | [Signal Jammed / Lost]
       v                                                 v
+--------------+                                  +--------------+
| Normal GNSS  |                                  |  AI + INS    |
| Navigation   |                                  | Dead Reckon. |
+-------+------+                                  +-------+------+
        |                                                 |
        +-----------------------+-------------------------+
                                |
                                v
               +----------------------------------+
               |  Unified Navigation HUD Engine   |
               |  • Real-time Drift Minimization  |
               |  • Route Matching & Clamping     |
               |  • Turn-by-Turn Maneuvers        |
               +----------------------------------+
```

---

## ✨ Key Features

### 📡 GNSS Anomaly & Jamming Detection
- Real-time satellite count tracking, signal quality assessment, and confidence scoring ($0\% - 100\%$).
- Instantaneous failover trigger within milliseconds of RF loss or blackout threshold.

### 🧭 AI + INS Dead Reckoning Engine
- Continuous sensor fusion (3-axis Accelerometer + Gyroscope) via `expo-sensors`.
- Dynamic drift tracking ($\text{m/km}$) and error-budget estimation during GNSS loss.
- Fallback simulation layer for devices without hardware sensors or during desktop web testing.

### 🗺️ Dynamic Turn-by-Turn Navigation HUD
- High-contrast, glare-resistant dark automotive user interface.
- Real-time speedometer, distance remaining, estimated time of arrival (ETA), and maneuver cards.
- Multi-map engine: Interactive OpenFreeMap / MapLibre vector maps, native map integration, and lightweight vector fallback canvases.

### 🔬 Environmental Jamming & Simulation Console
- Interactive testing suite to simulate tunnel entry, RF jamming, or spoofing on demand.
- Live IMU waveform visualizer displaying $X/Y$ acceleration and $Z$ angular velocity curves.
- Outage duration stopwatches and cumulative drift counters.

### 📊 Comprehensive Trip Analytics & Audit Logging
- Post-drive telemetry diagnostics: GNSS availability percentage, total outage time, drift accumulation, and average speed.
- Persistent trip history stored via AsyncStorage for fleet review and mission debriefs.

### 🚗 Multi-Vehicle Dynamics Profiles
- Configurable kinematics models for **Passenger Cars**, **Commercial Fleets / Heavy Trucks**, and **UAVs / Drones**.
- Sensor calibration utility and emergency dead-reckoning override switch.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Framework** | [React Native](https://reactnative.dev/) (0.86) with [Expo](https://expo.dev/) (SDK 57) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **State & Core Logic** | React Context API (`NavigationContext`) with high-frequency telemetry loops |
| **Sensors & Hardware** | `expo-sensors` (Accelerometer, Gyroscope), `expo-location` |
| **Mapping & GIS** | MapLibre Native, OpenFreeMap, React Native Maps, OpenStreetMap tiles |
| **Icons & Design** | `lucide-react-native`, `react-native-svg` custom vector telemetry charts |
| **Storage & Persistence**| `@react-native-async-storage/async-storage` |
| **Navigation Stack** | `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs` |

---

## 📁 Project Structure

```text
navguard-app/
├── App.tsx                          # App root with NavigationProvider
├── index.ts                         # Expo entry point
├── app.json                         # Expo configuration and permissions
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript compiler configuration
├── assets/                          # App icons, splash screens, and branding
├── scripts/
│   └── check-map-route.cjs          # Geometric validation & route boundary tests
└── src/
    ├── components/
    │   ├── common/                  # Reusable UI cards, headers, badges
    │   ├── navigation/              # Map viewports, turn banners, metrics sheets
    │   └── simulation/              # Live IMU waveform charts, telemetry displays
    ├── context/
    │   └── NavigationContext.tsx    # Core navigation state, DR logic, and simulation engine
    ├── data/
    │   ├── demoRoute.ts             # Route interpolation and distance mathematics
    │   └── pune-demo-route.json     # Georeferenced route geometry
    ├── navigation/
    │   └── AppNavigator.tsx         # Tab and stack routing configuration
    ├── screens/
    │   ├── SplashScreen.tsx         # Initial launch sequence
    │   ├── OnboardingScreen.tsx     # Feature introduction carousel
    │   ├── AuthScreen.tsx           # Fleet driver profile sign-in
    │   ├── HomeScreen.tsx           # Central dashboard & vehicle configuration
    │   ├── NavigationScreen.tsx     # Live turn-by-turn navigation HUD
    │   ├── DemoConsoleScreen.tsx    # Hackathon simulation console & waveform monitor
    │   ├── RoutePlannerScreen.tsx   # Origin/destination selector and route preview
    │   ├── TripsScreen.tsx          # Saved trip history and audit logs
    │   ├── TripSummaryScreen.tsx    # Post-trip diagnostic report
    │   ├── SettingsScreen.tsx       # Sensor rates, alert toggles, and display modes
    │   └── ProfileScreen.tsx        # Driver telemetry and account details
    └── theme/
        ├── colors.ts                # Automotive contrast palette
        ├── typography.ts            # High-legibility typography scale
        └── spacing.ts               # Layout and grid spacing constants
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **Package Manager**: `npm` (comes with Node) or `yarn` / `pnpm`
- **Expo Go App**: Optional, for testing on physical devices ([Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) or [App Store](https://apps.apple.com/app/expo-go/id982107779))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/DhruvChaudhari130905/NavGuard.git
   cd NavGuard/navguard-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Expo development server**:
   ```bash
   npx expo start
   ```

### Running on Different Platforms

- **Web Browser**:
  ```bash
  npx expo start --web
  ```
  *(Press `w` in terminal or open `http://localhost:8081`)*

- **Android Device / Emulator**:
  ```bash
  npx expo start --android
  ```

- **iOS Simulator (macOS)**:
  ```bash
  npx expo start --ios
  ```

- **Physical Device**:
  Open the camera or Expo Go app on your phone and scan the QR code printed in the terminal.

---

## 🎮 Running the Demo

For presentations, testing, or hackathon evaluations, follow these steps to experience the failover mechanism:

1. **Launch the App**: Navigate past the splash and onboarding screens to the **Home Screen**.
2. **Start Live Navigation**: Tap **"Start Navigation"** to enter the real-time HUD along the Pune test corridor.
3. **Open Simulation Console**:
   - Tap the **Simulation / Demo Console** shortcut.
   - Switch the **Environmental Jamming** toggle to `GNSS OFF`.
4. **Observe the Instant Failover**:
   - The HUD immediately updates its status to **`DEAD RECKONING (AI + INS)`**.
   - Position confidence adjusts dynamically based on elapsed outage duration.
   - The drift accumulation metric ($\text{m}$) calculates real-time positional uncertainty.
   - The **IMU Telemetry Waveform** displays active accelerometer ($X/Y$) and gyroscope ($Z$) signals.
5. **Restore Signal**:
   - Toggle the jamming switch back to `GNSS ON`.
   - The system executes re-acquisition, recalibrates drift to zero, and returns to **`GNSS OPTIMAL`**.
6. **Complete Trip**:
   - End the trip to review the **Trip Summary & Diagnostics Report**, including GNSS uptime percentage, outage intervals, and total route drift.

---

## 🧪 Verification & Quality Checks

Run the automated mathematical and spatial validation script:

```bash
node scripts/check-map-route.cjs
```

**Validated parameters**:
- Route endpoint integrity and boundary clamping
- Non-finite & NaN input resilience in position interpolation
- 1,000+ equidistant trajectory coordinate assertions

---

## 🗺️ Roadmap

- [x] Resilient AI + INS Dead Reckoning state engine
- [x] Environmental jamming & tunnel blackout simulation console
- [x] Live IMU waveform visualization
- [x] Post-trip audit logs and diagnostic summaries
- [x] Multi-vehicle kinematics profiles
- [ ] Direct Bluetooth OBD-II / CAN bus vehicle wheel-speed sensor integration
- [ ] Computer vision visual odometry (VO) secondary fallback via camera
- [ ] Fleet-wide crowdsourced GNSS interference mapping backend

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to use and adapt it for research and resilient navigation development.
