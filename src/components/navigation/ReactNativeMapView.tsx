import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import RNMapView, { Marker, Polyline, LatLng, Region, PROVIDER_DEFAULT } from 'react-native-maps';
import { Plus, Minus, LocateFixed } from 'lucide-react-native';
import { useNavigation } from '../../context/NavigationContext';
import { BLACKOUT_END, BLACKOUT_START } from '../../context/NavigationContext';
import { DEMO_ROUTE, positionAtProgress } from '../../data/demoRoute';

function toLatLng(coord: [number, number]): LatLng {
  return { latitude: coord[1], longitude: coord[0] };
}

export const MapView: React.FC = () => {
  const { routeProgress, isInsideBlackoutZone, currentSpeedKmh } = useNavigation();
  const mapRef = useRef<RNMapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const midLat = (DEMO_ROUTE[0][1] + DEMO_ROUTE[DEMO_ROUTE.length - 1][1]) / 2;
  const midLng = (DEMO_ROUTE[0][0] + DEMO_ROUTE[DEMO_ROUTE.length - 1][0]) / 2;
  const [region, setRegion] = useState<Region>({
    latitude: midLat, longitude: midLng, latitudeDelta: 0.05, longitudeDelta: 0.05,
  });
  const prevPositionRef = useRef<[number, number] | null>(null);
  const bearingRef = useRef(0);
  const [bearing, setBearing] = useState(0);
  const [directionsRoute, setDirectionsRoute] = useState<LatLng[]>([]);
  const vehiclePosition = useMemo(() => positionAtProgress(routeProgress), [routeProgress]);
  const directionsApiKey = process.env.EXPO_PUBLIC_OPENROUTESERVICE_API_KEY?.trim() ?? '';
  const origin = toLatLng(DEMO_ROUTE[0]);
  const destination = toLatLng(DEMO_ROUTE[DEMO_ROUTE.length - 1]);

  useEffect(() => {
    if (!directionsApiKey) {
      setDirectionsRoute([]);
      return;
    }

    const controller = new AbortController();
    const loadDirections = async () => {
      try {
        const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
          method: 'POST',
          headers: {
            Authorization: directionsApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            coordinates: [
              [origin.longitude, origin.latitude],
              [destination.longitude, destination.latitude],
            ],
            instructions: false,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`OpenRouteService returned ${response.status}`);
        }

        const data = await response.json() as {
          features?: Array<{ geometry?: { coordinates?: Array<[number, number]> } }>;
        };
        const coordinates = data.features?.[0]?.geometry?.coordinates;
        if (!coordinates || coordinates.length < 2) {
          throw new Error('OpenRouteService returned no route geometry');
        }

        setDirectionsRoute(coordinates.map(toLatLng));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('OpenRouteService directions failed; using saved demo route.', error);
          setDirectionsRoute([]);
        }
      }
    };

    void loadDirections();
    return () => controller.abort();
  }, [directionsApiKey, origin.latitude, origin.longitude, destination.latitude, destination.longitude]);

  const calcBearing = (from: [number, number], to: [number, number]): number => {
    const lat1 = from[1] * Math.PI / 180, lat2 = to[1] * Math.PI / 180;
    const dLon = (to[0] - from[0]) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
  };

  useEffect(() => {
    if (prevPositionRef.current) {
      const newBearing = calcBearing(prevPositionRef.current, vehiclePosition);
      // Only update state if bearing changed significantly to avoid excessive re-renders
      if (Math.abs(newBearing - bearingRef.current) > 0.5) {
        bearingRef.current = newBearing;
        setBearing(newBearing);
      }
    }
    prevPositionRef.current = vehiclePosition;
  }, [vehiclePosition]);

  const routeSegments = useMemo(() => {
    const total = DEMO_ROUTE.length;
    const s = Math.floor(total * 0.33), e = Math.floor(total * 0.67);
    return [
      { points: DEMO_ROUTE.slice(0, s + 1).map(toLatLng), color: '#4285f4', dashed: false },
      { points: DEMO_ROUTE.slice(s, e + 1).map(toLatLng), color: '#ea4335', dashed: true },
      { points: DEMO_ROUTE.slice(e, total).map(toLatLng), color: '#4285f4', dashed: false },
    ].filter(seg => seg.points.length > 1);
  }, []);
  const blackoutSegment = useMemo(() => {
    const start = Math.floor((DEMO_ROUTE.length - 1) * BLACKOUT_START);
    const end = Math.ceil((DEMO_ROUTE.length - 1) * BLACKOUT_END);
    return DEMO_ROUTE.slice(start, end + 1).map(toLatLng);
  }, []);

  const handleZoomIn = () => setRegion(p => ({ ...p, latitudeDelta: Math.max(p.latitudeDelta / 2, 0.001), longitudeDelta: Math.max(p.longitudeDelta / 2, 0.001) }));
  const handleZoomOut = () => setRegion(p => ({ ...p, latitudeDelta: Math.min(p.latitudeDelta * 2, 2), longitudeDelta: Math.min(p.longitudeDelta * 2, 2) }));
  const handleRecenter = () => mapRef.current?.animateToRegion({ latitude: vehiclePosition[1], longitude: vehiclePosition[0], latitudeDelta: 0.008, longitudeDelta: 0.008 }, 500);
  const handleFitRoute = () => mapRef.current?.fitToCoordinates([toLatLng(DEMO_ROUTE[0]), toLatLng(DEMO_ROUTE[DEMO_ROUTE.length - 1])], { edgePadding: { top: 80, left: 60, bottom: 80, right: 60 }, animated: true });

  return (
    <View style={styles.container}>
      <RNMapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        mapType="standard"
        pitchEnabled={false}
        zoomEnabled scrollEnabled
        showsCompass={false}
        showsUserLocation={false}
        showsMyLocationButton={false}
        loadingEnabled loadingBackgroundColor="#edf2f5"
        onMapReady={() => setMapReady(true)}
      >
        {directionsRoute.length > 1 && (
          <Polyline coordinates={directionsRoute} strokeWidth={5} strokeColor="#1664e8" />
        )}
        {routeSegments.map((seg, i) => (
          <Polyline
            key={`seg-${i}`}
            coordinates={seg.points}
            strokeWidth={directionsRoute.length > 1 ? 3 : 5}
            strokeColor={directionsRoute.length > 1 ? '#8aa4c2' : seg.color}
            lineDashPattern={seg.dashed ? [6, 6] : undefined}
          />
        ))}
        <Polyline
          coordinates={blackoutSegment}
          strokeWidth={8}
          strokeColor="#ea4335"
          lineDashPattern={[10, 8]}
          tappable
        />
        <Marker coordinate={toLatLng(DEMO_ROUTE[0])} title="Start: Zems Cycles" description="Starting point" pinColor="#2e7d32" />
        <Marker coordinate={toLatLng(DEMO_ROUTE[DEMO_ROUTE.length - 1])} title="End: MIT WPU Campus" description="Destination" pinColor="#ea4335" />
        <Marker
          coordinate={blackoutSegment[Math.floor(blackoutSegment.length / 2)]}
          title="Dead signal area"
          description="GNSS blocked - AI + INS dead reckoning active"
          pinColor="#ea4335"
        />
        <Marker coordinate={toLatLng(vehiclePosition)} title={`Vehicle · ${currentSpeedKmh.toFixed(1)} km/h`} description={isInsideBlackoutZone ? 'AI+INS Dead Reckoning' : 'GNSS Active'} anchor={{ x: 0.5, y: 0.5 }} rotation={bearing}>
          <View style={[styles.vehicle, isInsideBlackoutZone ? styles.vehicleOutage : styles.vehicleGnss]}>
            <View style={styles.vehicleInner} />
          </View>
        </Marker>
      </RNMapView>
      {!mapReady && (<View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#1664e8" /></View>)}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabBtn} onPress={handleZoomIn} activeOpacity={0.8}><Plus size={22} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.fabBtn} onPress={handleZoomOut} activeOpacity={0.8}><Minus size={22} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={styles.fabBtn} onPress={handleRecenter} activeOpacity={0.8}><LocateFixed size={22} color="#fff" /></TouchableOpacity>
        <TouchableOpacity style={[styles.fabBtn, { backgroundColor: '#444' }]} onPress={handleFitRoute} activeOpacity={0.8}><LocateFixed size={18} color="#aef" /></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  map: { ...StyleSheet.absoluteFill, backgroundColor: '#edf2f5' },
  loadingOverlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: '#edf2f5' },
  fabContainer: { position: 'absolute', right: 14, bottom: 130, gap: 10 },
  fabBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1a73e8', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  vehicle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  vehicleGnss: { backgroundColor: 'rgba(66,133,244,0.25)', borderColor: '#4285f4' },
  vehicleOutage: { backgroundColor: 'rgba(234,67,53,0.25)', borderColor: '#ea4335' },
  vehicleInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff' },
});
