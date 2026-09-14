import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEMO_ROUTE, routeDistanceKm, routeForTrip } from '../data/demoRoute';

export interface CompletedTrip {
  id: string;
  date: string;
  from: string;
  to: string;
  completed: boolean;
  distanceKm: number;
  durationMin: number;
  outageDurationFormatted: string;
  avgSpeedKmh: number;
  route: typeof DEMO_ROUTE;
}

export type GnssStatus = 'OPTIMAL' | 'DEGRADED' | 'LOST';
export type NavigationMode = 'GNSS_HEALTHY' | 'AI_INS_DR';

export interface IMUPoint {
  time: number;
  accelX: number;
  accelY: number;
  gyroZ: number;
}

export interface NavigationContextType {
  // Navigation & State Modes
  isNavigating: boolean;
  gnssStatus: GnssStatus;
  navigationMode: NavigationMode;
  isGnssSignalOn: boolean;
  isInsideBlackoutZone: boolean;

  // Real-time Telemetry
  satellitesVisible: number;
  signalQuality: string;
  positionConfidence: number; // 0 - 100%
  estimatedDriftMeters: number; // in meters
  driftRatePerKm: string; // e.g. "0.4m/km"
  outageDurationSeconds: number;
  formattedOutageTimer: string;

  // Active Route & Progress
  currentSpeedKmh: number;
  distanceRemainingKm: number;
  timeRemainingMinutes: number;
  etaString: string;
  nextTurnInstruction: string;
  nextTurnDistance: string;
  nextTurnStreet: string;
  routeProgress: number; // 0 - 1
  activeRoute: typeof DEMO_ROUTE;
  isSimulationPlaying: boolean;

  // IMU Live Telemetry
  imuTelemetry: IMUPoint[];

  // Completed Trip Summary Stats
  tripSummary: {
    totalDistanceKm: number;
    totalDurationMin: number;
    avgSpeedKmh: number;
    gnssAvailabilityPercent: number;
    outageDurationFormatted: string;
    aiInsActiveFormatted: string;
    finalDriftMeters: number;
  };
  completedTrips: CompletedTrip[];

  // Actions & Controls
  startNavigation: () => void;
  startNavigationWithRoute: (route: typeof DEMO_ROUTE, labels?: { from: string; to: string }) => void;
  beginNavigation: () => void;
  stopNavigation: () => void;
  setRouteProgress: (progress: number) => void;
  toggleSimulationPlay: () => void;
  toggleGnssSignal: (forcedState?: boolean) => void;
  recenterMap: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomLevel: number;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Short dead-signal zone centered on the middle of the route.
export const BLACKOUT_START = 0.45;
export const BLACKOUT_END = 0.55;

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [isSimulationPlaying, setIsSimulationPlaying] = useState<boolean>(false);
  const [isManualGnssOverride, setIsManualGnssOverride] = useState<boolean | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Route progression (0 to 1) - starts from 0.0 Origin
  const [routeProgress, setRouteProgressState] = useState<number>(0.0);
  const [tripNumber, setTripNumber] = useState(0);
  const [activeRoute, setActiveRoute] = useState(() => routeForTrip(0));
  const [activeRouteLabels, setActiveRouteLabels] = useState({ from: 'Selected Pune start', to: 'Selected destination' });
  const routeProgressRef = useRef(routeProgress);

  // Telemetry States
  const [satellitesVisible, setSatellitesVisible] = useState<number>(18);
  const [positionConfidence, setPositionConfidence] = useState<number>(98);
  const [estimatedDriftMeters, setEstimatedDriftMeters] = useState<number>(0.2);
  const [outageDurationSeconds, setOutageDurationSeconds] = useState<number>(0);
  const [highRateSensors, setHighRateSensors] = useState<boolean>(true);
  const tripStartedAtRef = useRef(Date.now());
  const [tripElapsedSeconds, setTripElapsedSeconds] = useState(0);
  const [completedTrips, setCompletedTrips] = useState<CompletedTrip[]>([]);
  const tripSavedRef = useRef(false);
  const outageStartedAtRef = useRef<number | null>(null);
  const outageDurationRef = useRef(0);

  // Load high rate sensors setting from AsyncStorage
  useEffect(() => {
    const loadHighRateSensorsSetting = async () => {
      try {
        const value = await AsyncStorage.getItem('highRateSensors');
        if (value !== null) {
          setHighRateSensors(value === 'true');
        }
        // Default to true if not set
      } catch (error) {
        console.error('Failed to load high rate sensors setting:', error);
      }
    };

    loadHighRateSensorsSetting();
  }, []);

  useEffect(() => {
    const loadCompletedTrips = async () => {
      try {
        const stored = await AsyncStorage.getItem('completedTrips');
        if (stored) setCompletedTrips(JSON.parse(stored) as CompletedTrip[]);
      } catch (error) {
        console.error('Failed to load completed trips:', error);
      }
    };
    void loadCompletedTrips();
  }, []);
  const isAutoInBlackout = isNavigating
    && routeProgress >= BLACKOUT_START
    && routeProgress <= BLACKOUT_END;

  // Manual GNSS overrides persist until user manually changes them
// No automatic clearing to allow simulated outages to continue beyond blackout zones
  useEffect(() => {
    // Intentionally left empty
  }, [isAutoInBlackout, isManualGnssOverride]);

  // Dead reckoning is active only while the vehicle is physically inside the zone.
  const isInsideBlackoutZone = isAutoInBlackout;
  const isGnssSignalOn = !isInsideBlackoutZone;
  const activeRouteDistanceKm = routeDistanceKm(activeRoute);

  useEffect(() => {
    if (isInsideBlackoutZone && outageStartedAtRef.current === null) {
      outageStartedAtRef.current = Date.now();
      return;
    }

    if (!isInsideBlackoutZone && outageStartedAtRef.current !== null) {
      outageDurationRef.current += (Date.now() - outageStartedAtRef.current) / 1000;
      outageStartedAtRef.current = null;
      setOutageDurationSeconds(outageDurationRef.current);
    }
  }, [isInsideBlackoutZone]);

  // Dynamic real-time trip metrics driven by car route progression
  const distanceRemainingKm = +(Math.max(0.1, (1 - routeProgress) * activeRouteDistanceKm)).toFixed(1);
  const timeRemainingMinutes = Math.max(1, Math.round(distanceRemainingKm * 1.8));

  // Route has 10 waypoints (idx 0-9), each segment = 1/9 of total progress.
  // Turns occur at waypoint indices 1-8, i.e. at progress = i/9.
  const TURN_WAYPOINTS = [1, 2, 7, 8].map((i) => i / 9); // sharp turns only
  const TURN_WINDOW = 0.05;  // ±5% progress window around each turn to decelerate
  const TURN_SPEED_MIN = 10; // km/h at the apex of the turn

  // Compute how deep into a turn zone we are: 0 = straight road, 1 = apex
  const turnInfluence = TURN_WAYPOINTS.reduce((maxInfl, tp) => {
    const dist = Math.abs(routeProgress - tp);
    if (dist < TURN_WINDOW) {
      // Smooth bell curve: 0 at edges, 1 at apex
      const infl = 1 - dist / TURN_WINDOW;
      return Math.max(maxInfl, infl);
    }
    return maxInfl;
  }, 0);

  // Compute next turn instruction based on route progress
  const computeNextTurnInstruction = () => {
    // Find the next turn waypoint ahead of current position
    const nextTurnIndex = TURN_WAYPOINTS.findIndex(tp => tp > routeProgress);

    if (nextTurnIndex === -1) {
      // No more turns ahead
      return {
        instruction: 'Arrived at destination',
        distance: '0 m',
        street: 'Destination'
      };
    }

    const nextTurnProgress = TURN_WAYPOINTS[nextTurnIndex];
    const distanceToTurn = Math.max(0, (nextTurnProgress - routeProgress) * activeRouteDistanceKm); // in km
    const distanceToTurnMeters = distanceToTurn * 1000; // in meters

    // Get turn information based on waypoint index
    // Waypoint indices: 1=DP Road turn, 2=something, 7=something, 8=something
    const waypointInfo = {
      1: { instruction: 'Turn left on DP Road', street: 'MIT WPU Campus' },
      2: { instruction: 'Turn right onto Highway', street: 'MIT WPU Campus' },
      7: { instruction: 'Turn left on WPU Blvd', street: 'MIT WPU Campus' },
      8: { instruction: 'Turn right into Campus', street: 'MIT WPU Campus' }
    };

    const turnWaypointIndices = [1, 2, 7, 8] as const;
    const turnWaypointIndex = turnWaypointIndices[nextTurnIndex];
    const info = turnWaypointIndex === undefined
      ? { instruction: 'Continue straight', street: 'Unknown Road' }
      : waypointInfo[turnWaypointIndex];

    return {
      instruction: info.instruction,
      distance: `${Math.max(50, Math.round(distanceToTurnMeters))} m`,
      street: info.street
    };
  };

  const {
    instruction: nextTurnInstruction,
    distance: nextTurnDistance,
    street: nextTurnStreet
  } = computeNextTurnInstruction();

  // Base speed: open road 48-52, underpass 35-38
  const baseSpeed = isInsideBlackoutZone
    ? Math.round(35 + Math.sin(routeProgress * 40) * 3)
    : Math.round(48 + Math.sin(routeProgress * 25) * 4);

  // At turn apex: lerp down to TURN_SPEED_MIN (10 km/h)
  const currentSpeedKmh = Math.round(baseSpeed + (TURN_SPEED_MIN - baseSpeed) * turnInfluence);

  // Dynamic ETA string based on remaining travel time
  const etaDate = new Date(Date.now() + timeRemainingMinutes * 60 * 1000);
  const etaString = etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // IMU real-time stream
  const [imuTelemetry, setImuTelemetry] = useState<IMUPoint[]>([]);

  // Computed Mode
  const navigationMode: NavigationMode = isInsideBlackoutZone ? 'AI_INS_DR' : 'GNSS_HEALTHY';
  const gnssStatus: GnssStatus = isInsideBlackoutZone ? 'LOST' : 'OPTIMAL';
  const signalQuality = isInsideBlackoutZone ? 'Blocked (DR Active)' : 'Strong (18 Sats)';
  const driftRatePerKm = isInsideBlackoutZone ? '0.4m/km' : '0.0m/km';

  // Format outage timer mm:ss
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // 60 FPS Smooth car motion loop
  useEffect(() => {
    if (!isNavigating || !isSimulationPlaying) return;
    const interval = setInterval(() => {
      routeProgressRef.current += 0.0005;
      if (routeProgressRef.current >= 1) {
        routeProgressRef.current = 1;
        setIsSimulationPlaying(false);
        setIsNavigating(false);
      }
      setRouteProgressState(+routeProgressRef.current.toFixed(5));
    }, 100); // 10 updates per second to prevent max update depth on web

    return () => clearInterval(interval);
  }, [isNavigating, isSimulationPlaying]);

  // Telemetry & IMU timer loop - interval based on highRateSensors setting
  useEffect(() => {
    // Throttled to 10Hz to prevent max update depth exceeded on web
    const intervalMs = highRateSensors ? 100 : 400;
    const interval = setInterval(() => {
      if (!isNavigating) return;
      // 1. Handle Blackout Zone Telemetry
      if (isInsideBlackoutZone) {
        setSatellitesVisible(0);
        setPositionConfidence((prev) => Math.max(88, Math.min(94, 91.5 + Math.sin(Date.now() / 800) * 2)));
        setEstimatedDriftMeters((prev) => +(Math.min(3.8, prev + 0.04)).toFixed(2));
      } else {
        setSatellitesVisible(18);
        setPositionConfidence(98);
        setEstimatedDriftMeters(0.2);
      }

      // 2. Generate IMU stream at throttled rate
      const now = Date.now();
      const timeFactor = intervalMs / 10;
      const accelX = +(Math.sin(now / (250 * timeFactor)) * 1.8 + (Math.random() - 0.5) * 0.3).toFixed(2);
      const accelY = +(Math.cos(now / (350 * timeFactor)) * 0.9 + (Math.random() - 0.5) * 0.2).toFixed(2);
      const gyroZ = +(Math.sin(now / (180 * timeFactor)) * 2.4 + (Math.random() - 0.5) * 0.4).toFixed(2);

      setImuTelemetry((prev) => {
        const next = [...prev, { time: now, accelX, accelY, gyroZ }];
        return next.slice(-30);
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isInsideBlackoutZone, highRateSensors, isNavigating]);

  useEffect(() => {
    if (isInsideBlackoutZone) {
      setSatellitesVisible(0);
      setPositionConfidence((prev) => Math.max(88, Math.min(94, prev)));
      setEstimatedDriftMeters((prev) => Math.max(0.2, prev));
    } else {
      setSatellitesVisible(18);
      setPositionConfidence(98);
      setEstimatedDriftMeters(0.2);
    }
  }, [isInsideBlackoutZone]);

  useEffect(() => {
    if (!isNavigating) return;
    const interval = setInterval(() => {
      setTripElapsedSeconds(Math.max(0, (Date.now() - tripStartedAtRef.current) / 1000));
    }, 250);
    return () => clearInterval(interval);
  }, [isNavigating]);

  const setRouteProgress = useCallback((progress: number) => {
    const nextProgress = Math.min(1, Math.max(0, progress));
    routeProgressRef.current = nextProgress;
    setRouteProgressState(nextProgress);
  }, []);

  const toggleSimulationPlay = useCallback(() => {
    setIsSimulationPlaying((prev) => !prev);
  }, []);

  const startNavigationWithRoute = useCallback((route: typeof DEMO_ROUTE, labels?: { from: string; to: string }) => {
    const nextTripNumber = tripNumber + 1;
    setTripNumber(nextTripNumber);
    setActiveRoute(route.length > 1 ? route : routeForTrip(nextTripNumber));
    setActiveRouteLabels(labels ?? { from: 'Selected Pune start', to: 'Selected destination' });
    setIsNavigating(false);
    setIsSimulationPlaying(false);
    routeProgressRef.current = 0.0;
    tripStartedAtRef.current = Date.now();
    setTripElapsedSeconds(0);
    setOutageDurationSeconds(0);
    outageStartedAtRef.current = null;
    outageDurationRef.current = 0;
    tripSavedRef.current = false;
    setRouteProgressState(0.0);
  }, [tripNumber]);

  const beginNavigation = useCallback(() => {
    setIsNavigating(true);
    setIsSimulationPlaying(true);
    tripStartedAtRef.current = Date.now();
    setTripElapsedSeconds(0);
  }, []);

  const startNavigation = useCallback(() => {
    startNavigationWithRoute(routeForTrip(tripNumber + 1));
    beginNavigation();
  }, [beginNavigation, startNavigationWithRoute, tripNumber]);

  const stopNavigation = useCallback(() => {
    if (outageStartedAtRef.current !== null) {
      outageDurationRef.current += (Date.now() - outageStartedAtRef.current) / 1000;
      outageStartedAtRef.current = null;
      setOutageDurationSeconds(outageDurationRef.current);
    }

    if (!tripSavedRef.current && routeProgress > 0) {
      const distanceKm = +(routeProgress * activeRouteDistanceKm).toFixed(2);
      const durationMin = +(tripElapsedSeconds / 60).toFixed(1);
      const trip: CompletedTrip = {
        id: `${Date.now()}`,
        date: new Date().toLocaleString(),
        from: activeRouteLabels.from,
        to: activeRouteLabels.to,
        completed: routeProgress >= 1,
        distanceKm,
        durationMin,
        outageDurationFormatted: formatTimer(Math.round(outageDurationRef.current)),
        avgSpeedKmh: durationMin > 0 ? +(distanceKm / (durationMin / 60)).toFixed(1) : 0,
        route: activeRoute,
      };
      const nextTrips = [trip, ...completedTrips].slice(0, 20);
      tripSavedRef.current = true;
      setCompletedTrips(nextTrips);
      void AsyncStorage.setItem('completedTrips', JSON.stringify(nextTrips)).catch((error) => {
        console.error('Failed to save completed trip:', error);
      });
    }
    setIsNavigating(false);
    setIsSimulationPlaying(false);
  }, [activeRoute, activeRouteDistanceKm, activeRouteLabels, completedTrips, routeProgress, tripElapsedSeconds]);

  const toggleGnssSignal = useCallback((forcedState?: boolean) => {
    setIsManualGnssOverride((prev) => {
      if (forcedState !== undefined) return forcedState;
      if (prev === null) return false;
      return !prev;
    });
  }, []);

  const recenterMap = useCallback(() => {
    setZoomLevel(1);
  }, []);

  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(2.2, prev + 0.25));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(0.8, prev - 0.25));
  }, []);

  const traveledDistanceKm = routeProgress * activeRouteDistanceKm;
  const totalDurationMin = tripElapsedSeconds / 60;
  const avgSpeedKmh = totalDurationMin > 0
    ? traveledDistanceKm / (totalDurationMin / 60)
    : 0;
  const outageSeconds = Math.min(tripElapsedSeconds, outageDurationSeconds);
  const gnssAvailabilityPercent = tripElapsedSeconds > 0
    ? Math.max(0, Math.min(100, ((tripElapsedSeconds - outageSeconds) / tripElapsedSeconds) * 100))
    : 100;
  const tripSummary = {
    totalDistanceKm: +traveledDistanceKm.toFixed(2),
    totalDurationMin: +totalDurationMin.toFixed(1),
    avgSpeedKmh: +avgSpeedKmh.toFixed(1),
    gnssAvailabilityPercent: +gnssAvailabilityPercent.toFixed(1),
    outageDurationFormatted: formatTimer(Math.round(outageSeconds)),
    aiInsActiveFormatted: formatTimer(Math.round(outageSeconds)),
    finalDriftMeters: +estimatedDriftMeters.toFixed(2),
  };

  return (
    <NavigationContext.Provider
      value={{
        isNavigating,
        gnssStatus,
        navigationMode,
        isGnssSignalOn,
        isInsideBlackoutZone,
        satellitesVisible,
        signalQuality,
        positionConfidence,
        estimatedDriftMeters,
        driftRatePerKm,
        outageDurationSeconds,
        formattedOutageTimer: formatTimer(outageDurationSeconds),
        currentSpeedKmh,
        distanceRemainingKm,
        timeRemainingMinutes,
        etaString,
        nextTurnInstruction: isInsideBlackoutZone ? 'Stay on MIT WPU Bypass' : 'Turn left on DP Road',
        nextTurnDistance: isInsideBlackoutZone ? `for ${distanceRemainingKm} km` : `in ${Math.max(50, Math.round(distanceRemainingKm * 100))} m`,
        nextTurnStreet: isInsideBlackoutZone ? 'MIT WPU Underpass' : 'MIT WPU Campus',
        routeProgress,
        activeRoute,
        isSimulationPlaying,
        imuTelemetry,
        tripSummary,
        completedTrips,
        startNavigation,
        startNavigationWithRoute,
        beginNavigation,
        stopNavigation,
        setRouteProgress,
        toggleSimulationPlay,
        toggleGnssSignal,
        recenterMap,
        zoomIn,
        zoomOut,
        zoomLevel,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
