import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, CameraRef, GeoJSONSource, Layer, Map, MapRef } from '@maplibre/maplibre-react-native';
import { useNavigation } from '../../context/NavigationContext';
import { DEMO_ROUTE_KM, MAP_STYLE_URL, ROUTE_BOUNDS, endpointsFeature, positionAtProgress, routeFeature } from '../../data/demoRoute';

const MIN_ZOOM = 3;
const MAX_ZOOM = 19;
const padding = { top: 72, right: 60, bottom: 44, left: 32 };
const initialViewState = { bounds: ROUTE_BOUNDS, padding };

// Custom Android/iOS builds only. Never import this module eagerly in Expo Go.
export const MapView: React.FC = () => {
  const { routeProgress, isGnssSignalOn, isSimulationPlaying, toggleSimulationPlay, setRouteProgress } = useNavigation();
  const camera = useRef<CameraRef>(null);
  const map = useRef<MapRef>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(13);
  // Limit geometry bridge updates to 10 Hz despite the existing high-rate context.
  const progressRef = useRef(routeProgress);

  // Update ref when routeProgress changes (better than updating on every render)
  useEffect(() => {
    progressRef.current = routeProgress;
  }, [routeProgress]);

  const [displayProgress, setDisplayProgress] = useState(routeProgress);
  useEffect(() => {
    const timer = setInterval(() => setDisplayProgress(progressRef.current), 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loadState !== 'loading') return;
    const timer = setTimeout(() => setLoadState('error'), 20000);
    return () => clearTimeout(timer);
  }, [loadState, attempt]);

  const position = useMemo(() => positionAtProgress(displayProgress), [displayProgress]);
  const vehicle: GeoJSON.Feature<GeoJSON.Point> = useMemo(() => ({
    type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: position },
  }), [position]);
  const colour = isGnssSignalOn ? '#1664e8' : '#d16b00';

  const changeZoom = async (delta: number) => {
    try {
      const current = await map.current?.getZoom();
      if (current === undefined) return; // Early exit if map not ready
      const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, current + delta));
      camera.current?.zoomTo(next, { duration: 200 });
      setZoom(next);
    } catch (error) {
      console.warn('Failed to change zoom:', error);
      setLoadState('error');
    }
  };

  // Keep the native map tree stable between the throttled position updates.
  // Only recreate when attempt changes (for retry) or when vehicle/colour actually changes
  const nativeMap = useMemo(() => (
        <Map
          key={attempt}
          ref={map}
          style={styles.map}
          mapStyle={MAP_STYLE_URL}
          attribution
          attributionPosition={{ bottom: 8, left: 8 }}
          compass
          compassPosition={{ top: 70, left: 12 }}
          onDidFinishLoadingMap={() => setLoadState('ready')}
          onDidFailLoadingMap={() => setLoadState('error')}
          onRegionDidChange={event => setZoom(event.nativeEvent.zoom)}
        >
          <Camera ref={camera} initialViewState={initialViewState} minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} />
          <GeoJSONSource id="demo-road-route" data={routeFeature}>
            <Layer id="route-outline" type="line" paint={{ 'line-color': '#ffffff', 'line-width': 9 }} layout={{ 'line-cap': 'round', 'line-join': 'round' }} />
            <Layer id="route-line" type="line" paint={{ 'line-color': '#1664e8', 'line-width': 5 }} layout={{ 'line-cap': 'round', 'line-join': 'round' }} />
          </GeoJSONSource>
          <GeoJSONSource id="route-endpoints" data={endpointsFeature}>
            <Layer id="endpoint-dots" type="circle" paint={{ 'circle-color': '#10243a', 'circle-radius': 6, 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 }} />
          </GeoJSONSource>
          <GeoJSONSource id="demo-vehicle" data={vehicle}>
            <Layer id="vehicle-halo" type="circle" paint={{ 'circle-radius': 18, 'circle-color': colour, 'circle-opacity': 0.18 }} />
            <Layer id="vehicle-dot" type="circle" paint={{ 'circle-radius': 8, 'circle-color': colour, 'circle-stroke-color': '#fff', 'circle-stroke-width': 3 }} />
          </GeoJSONSource>
        </Map>
  ), [attempt, vehicle, colour]);

  return (
    <View style={styles.container}>
      <View style={styles.mapArea}>
        {nativeMap}
        <View style={styles.banner} pointerEvents="none">
          <Text style={styles.title}>Pune street map</Text>
          <Text style={styles.subtitle}>{DEMO_ROUTE_KM.toFixed(1)} km saved demo route · {isGnssSignalOn ? 'Simulated GNSS on' : 'Simulated GNSS outage'}</Text>
        </View>

        {loadState === 'ready' && (
          <View style={styles.controls}>
            <MapButton label="Zoom in" text="+" disabled={zoom >= MAX_ZOOM} onPress={() => { void changeZoom(1); }} />
            <MapButton label="Zoom out" text="−" disabled={zoom <= MIN_ZOOM} onPress={() => { void changeZoom(-1); }} />
            <MapButton label="Center on simulated vehicle" text="◎" onPress={() => camera.current?.easeTo({ center: position, zoom: 16, duration: 350 })} />
            <MapButton label="Show entire route" text="↔" onPress={() => camera.current?.fitBounds(ROUTE_BOUNDS, { padding, duration: 350 })} />
          </View>
        )}

        {loadState !== 'ready' && (
          <View style={styles.message} accessibilityLiveRegion="polite">
            {loadState === 'loading' ? <ActivityIndicator color="#1664e8" /> : null}
            <Text style={styles.messageText}>{loadState === 'loading' ? 'Loading street map…' : 'Map could not load. Connect to the internet and retry.'}</Text>
            {loadState === 'error' && <MapButton label="Retry loading map" text="Retry" onPress={() => { setLoadState('loading'); setAttempt(value => value + 1); }} />}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.disclaimer}>Demo vehicle, not your live location. Street tiles need internet.</Text>
        <View style={styles.playback}>
          <MapButton label={isSimulationPlaying ? 'Pause simulation' : 'Play simulation'} text={isSimulationPlaying ? 'Pause' : 'Play'} onPress={toggleSimulationPlay} />
          <MapButton label="Move simulation to route start" text="Start" onPress={() => setRouteProgress(0)} />
          <MapButton label="Move simulation to midpoint" text="Midpoint" onPress={() => setRouteProgress(0.5)} />
          <MapButton label="Move simulation near route end" text="Near end" onPress={() => setRouteProgress(0.98)} />
        </View>
        <TouchableOpacity accessibilityRole="link" accessibilityLabel="Open map data attribution" onPress={() => { void Linking.openURL('https://openfreemap.org/').catch(() => {}); }}>
          <Text style={styles.attribution}>OpenFreeMap · OpenMapTiles · © OpenStreetMap contributors</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function MapButton({ label, text, onPress, disabled = false }: { label: string; text: string; onPress: () => void; disabled?: boolean }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[styles.button, disabled && styles.disabled]}><Text style={styles.buttonText}>{text}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#edf2f5' },
  mapArea: { flex: 1, minHeight: 140 },
  map: { flex: 1 },
  banner: { position: 'absolute', top: 10, left: 10, right: 10, backgroundColor: '#ffffffee', borderRadius: 12, padding: 10 },
  title: { fontSize: 15, fontWeight: '700', color: '#10243a' },
  subtitle: { fontSize: 11, lineHeight: 16, color: '#42576a' },
  controls: { position: 'absolute', right: 10, top: 78, gap: 6 },
  button: { minWidth: 44, minHeight: 44, paddingHorizontal: 9, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#cdd9e3' },
  buttonText: { color: '#10243a', fontWeight: '700', fontSize: 13 },
  disabled: { opacity: 0.4 },
  message: { position: 'absolute', top: 76, left: 14, right: 14, padding: 14, gap: 10, alignItems: 'center', borderRadius: 12, backgroundColor: '#ffffffee' },
  messageText: { textAlign: 'center', color: '#10243a', fontSize: 13 },
  footer: { padding: 8, gap: 6, backgroundColor: '#f7fafc' },
  disclaimer: { fontSize: 11, color: '#42576a', textAlign: 'center' },
  playback: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  attribution: { fontSize: 10, color: '#42576a', textAlign: 'center', paddingVertical: 2 },
});
