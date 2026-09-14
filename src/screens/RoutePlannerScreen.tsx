import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react-native';
import { Colors, Typography } from '../theme';
import { Coordinate } from '../data/demoRoute';
import { useNavigation } from '../context/NavigationContext';

interface RoutePlannerScreenProps {
  onBack: () => void;
  onRouteStarted: () => void;
}

interface OrsFeature {
  geometry?: { coordinates?: Array<[number, number]> };
  properties?: {
    summary?: {
      distance?: number;
      duration?: number;
    };
  };
}

interface LocationSuggestion {
  label: string;
  coordinates?: Coordinate;
  saved?: boolean;
}

interface RouteOption {
  coordinates: Coordinate[];
  distanceKm: number;
  durationMinutes: number;
}

const routePointDistanceMeters = (first: Coordinate, second: Coordinate) => {
  const earthRadiusMeters = 6371000;
  const latitudeDelta = (second[1] - first[1]) * Math.PI / 180;
  const longitudeDelta = (second[0] - first[0]) * Math.PI / 180;
  const firstLatitude = first[1] * Math.PI / 180;
  const secondLatitude = second[1] * Math.PI / 180;
  const value = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

const routeDistanceMeters = (coordinates: Coordinate[]) =>
  coordinates.reduce(
    (total, coordinate, index) => index === 0
      ? total
      : total + routePointDistanceMeters(coordinates[index - 1], coordinate),
    0,
  );

const routeSimilarity = (first: Coordinate[], second: Coordinate[]) => {
  const sampleCount = 24;
  const matchingDistanceMeters = 120;
  const matchingSamples = (source: Coordinate[], target: Coordinate[]) => {
    let matches = 0;
    for (let index = 0; index < sampleCount; index += 1) {
      const sourcePoint = source[Math.round(index * (source.length - 1) / (sampleCount - 1))];
      const isCloseToTarget = target.some(targetPoint =>
        routePointDistanceMeters(sourcePoint, targetPoint) <= matchingDistanceMeters,
      );
      if (isCloseToTarget) matches += 1;
    }
    return matches / sampleCount;
  };

  return (matchingSamples(first, second) + matchingSamples(second, first)) / 2;
};

const removeSimilarRoutes = (options: RouteOption[]) => {
  const uniqueOptions: RouteOption[] = [];
  options.forEach(option => {
    const isSimilar = uniqueOptions.some(existing =>
      routeSimilarity(existing.coordinates, option.coordinates) >= 0.8,
    );
    if (!isSimilar) uniqueOptions.push(option);
  });
  return uniqueOptions;
};

function RouteComparisonMap({ options, selectedIndex, onSelect }: {
  options: RouteOption[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const routeData = options.map(option => option.coordinates.map(([lng, lat]) => [lat, lng]));
  const html = `<!doctype html><html><head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
    <style>html,body,#map{height:100%;margin:0;background:#edf2f5}</style>
    </head><body><div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const routes=${JSON.stringify(routeData)};
      const colors=['#1664e8','#ea4335','#f59e0b'];
      const map=L.map('map');
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
      const layers=routes.map((route,index)=>L.polyline(route,{color:colors[index%colors.length],weight:index===${selectedIndex}?8:5,opacity:index===${selectedIndex}?1:.55}).addTo(map).on('click',()=>window.ReactNativeWebView.postMessage(String(index))));
      const all=routes.flat(); if(all.length) map.fitBounds(all,{padding:[20,20]});
    </script></body></html>`;
  return (
    <View style={styles.comparisonMap}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        onMessage={(event) => {
          const index = Number(event.nativeEvent.data);
          if (Number.isInteger(index) && index >= 0 && index < options.length) onSelect(index);
        }}
        style={styles.comparisonWebView}
      />
    </View>
  );
}

const PUNE_BOUNDS = {
  minLongitude: 73.70,
  minLatitude: 18.38,
  maxLongitude: 74.05,
  maxLatitude: 18.70,
};

const isInPune = ([longitude, latitude]: Coordinate) =>
  longitude >= PUNE_BOUNDS.minLongitude
  && longitude <= PUNE_BOUNDS.maxLongitude
  && latitude >= PUNE_BOUNDS.minLatitude
  && latitude <= PUNE_BOUNDS.maxLatitude;

export const RoutePlannerScreen: React.FC<RoutePlannerScreenProps> = ({ onBack, onRouteStarted }) => {
  const { startNavigationWithRoute } = useNavigation();
  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedStart, setSelectedStart] = useState<Coordinate | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Coordinate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<'start' | 'destination' | null>(null);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [savedSuggestions, setSavedSuggestions] = useState<LocationSuggestion[]>([]);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTESERVICE_API_KEY?.trim() ?? '';

  useEffect(() => {
    let disposed = false;
    const loadSavedSuggestions = async () => {
      try {
        const stored = await AsyncStorage.getItem('savedLocations');
        if (!stored || disposed) return;
        const saved = JSON.parse(stored) as Array<{ label?: string; sub?: string }>;
        const query = (focusedField === 'start' ? start : destination).trim().toLowerCase();
        const matches = saved
          .filter(location => location.label && location.sub)
          .filter(location => !query || `${location.label} ${location.sub}`.toLowerCase().includes(query))
          .map(location => ({ label: `${location.label} · ${location.sub}`, saved: true }));
        setSavedSuggestions(matches);
      } catch (error) {
        console.error('Failed to load saved locations:', error);
      }
    };
    if (focusedField) void loadSavedSuggestions();
    return () => { disposed = true; };
  }, [destination, focusedField, start]);

  useEffect(() => {
    const query = focusedField === 'start' ? start.trim() : destination.trim();
    if (!apiKey || !focusedField || query.length < 3) {
      setSuggestions(savedSuggestions);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      const loadSuggestions = async () => {
        try {
          const url = `https://api.openrouteservice.org/geocode/autocomplete?api_key=${encodeURIComponent(apiKey)}&text=${encodeURIComponent(`${query}, Pune, Maharashtra`)}&boundary.rect.min_lon=${PUNE_BOUNDS.minLongitude}&boundary.rect.min_lat=${PUNE_BOUNDS.minLatitude}&boundary.rect.max_lon=${PUNE_BOUNDS.maxLongitude}&boundary.rect.max_lat=${PUNE_BOUNDS.maxLatitude}&size=5`;
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok) throw new Error(`Location suggestions failed (${response.status})`);
          const data = await response.json() as {
            features?: Array<{ properties?: { label?: string }; geometry?: { coordinates?: [number, number] } }>;
          };
          const apiSuggestions = (data.features ?? [])
              .filter(feature => feature.properties?.label && feature.geometry?.coordinates)
              .filter(feature => isInPune(feature.geometry?.coordinates as Coordinate))
              .map(feature => ({
                label: feature.properties?.label ?? '',
                coordinates: feature.geometry?.coordinates as Coordinate,
              }));
          setSuggestions([
            ...savedSuggestions,
            ...apiSuggestions.filter(option =>
              !savedSuggestions.some(saved => saved.label.toLowerCase() === option.label.toLowerCase()),
            ),
          ]);
        } catch (suggestionError) {
          if (!controller.signal.aborted) {
            setSuggestions(savedSuggestions);
            console.warn('Location suggestions failed:', suggestionError);
          }
        }
      };
      void loadSuggestions();
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [apiKey, destination, focusedField, savedSuggestions, start]);

  const geocode = async (query: string): Promise<Coordinate> => {
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${encodeURIComponent(apiKey)}&text=${encodeURIComponent(`${query}, Pune, Maharashtra`)}&boundary.rect.min_lon=${PUNE_BOUNDS.minLongitude}&boundary.rect.min_lat=${PUNE_BOUNDS.minLatitude}&boundary.rect.max_lon=${PUNE_BOUNDS.maxLongitude}&boundary.rect.max_lat=${PUNE_BOUNDS.maxLatitude}&size=1`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Location search failed (${response.status})`);
    const data = await response.json() as { features?: Array<{ geometry?: { coordinates?: [number, number] } }> };
    const coordinates = data.features?.[0]?.geometry?.coordinates;
    if (!coordinates) throw new Error(`Could not find "${query}"`);
    return coordinates;
  };

  const startRoute = async () => {
    if (!apiKey) {
      setError('OpenRouteService key is missing. Add it to .env.local and restart Expo.');
      return;
    }
    if (!start.trim() || !destination.trim()) {
      setError('Enter both a start location and destination.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [origin, target] = await Promise.all([
        selectedStart ?? geocode(start.trim()),
        selectedDestination ?? geocode(destination.trim()),
      ]);
      const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
        method: 'POST',
        headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates: [origin, target],
          instructions: false,
          alternative_routes: {
            target_count: 3,
            share_factor: 0.6,
            weight_factor: 1.4,
          },
        }),
      });
      if (!response.ok) throw new Error(`Route calculation failed (${response.status})`);
      const data = await response.json() as { features?: OrsFeature[] };
      const options = removeSimilarRoutes((data.features ?? [])
        .map((feature): RouteOption | null => {
          const coordinates = feature.geometry?.coordinates;
          if (!coordinates || coordinates.length < 2) return null;
          const distanceMeters = feature.properties?.summary?.distance ?? routeDistanceMeters(coordinates);
          return {
            coordinates,
            distanceKm: +(distanceMeters / 1000).toFixed(1),
            durationMinutes: Math.max(1, Math.round((feature.properties?.summary?.duration ?? 0) / 60)),
          };
        })
        .filter((option): option is RouteOption => option !== null)
        .sort((first, second) => first.distanceKm - second.distanceKm));
      if (options.length === 0) throw new Error('No drivable route was returned.');

      setRouteOptions(options);
      setSelectedRouteIndex(0);
    } catch (routeError) {
      setError(routeError instanceof Error ? routeError.message : 'Unable to create route.');
    } finally {
      setLoading(false);
    }
  };

  const previewSelectedRoute = () => {
    const selectedRoute = routeOptions[selectedRouteIndex];
    if (!selectedRoute) return;
    startNavigationWithRoute(selectedRoute.coordinates, { from: start.trim(), to: destination.trim() });
    onRouteStarted();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} accessibilityLabel="Back">
          <ArrowLeft size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.titleBlock}>
          <Text style={[Typography.titleLg, styles.title]}>Plan a route</Text>
          <Text style={[Typography.bodySm, styles.subtitle]}>Choose where navigation should begin and end.</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <MapPin size={20} color={Colors.primaryBrand} />
          <TextInput
            value={start}
            onChangeText={(value) => {
              setStart(value);
              setSelectedStart(null);
              setRouteOptions([]);
              setSelectedRouteIndex(0);
            }}
            onFocus={() => setFocusedField('start')}
            placeholder="Start location"
            placeholderTextColor="#718096"
            style={styles.input}
          />
        </View>
        {focusedField === 'start' && suggestions.length > 0 && (
          <SuggestionList suggestions={suggestions} onSelect={(suggestion) => {
            setStart(suggestion.label);
            setSelectedStart(suggestion.coordinates ?? null);
            setRouteOptions([]);
            setSelectedRouteIndex(0);
            setSuggestions([]);
            setFocusedField(null);
          }} />
        )}
        <View style={styles.connector} />
        <View style={styles.inputGroup}>
          <Navigation size={20} color="#ea4335" />
          <TextInput
            value={destination}
            onChangeText={(value) => {
              setDestination(value);
              setSelectedDestination(null);
              setRouteOptions([]);
              setSelectedRouteIndex(0);
            }}
            onFocus={() => setFocusedField('destination')}
            placeholder="Destination"
            placeholderTextColor="#718096"
            style={styles.input}
          />
        </View>
        {focusedField === 'destination' && suggestions.length > 0 && (
          <SuggestionList suggestions={suggestions} onSelect={(suggestion) => {
            setDestination(suggestion.label);
            setSelectedDestination(suggestion.coordinates ?? null);
            setRouteOptions([]);
            setSelectedRouteIndex(0);
            setSuggestions([]);
            setFocusedField(null);
          }} />
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        {routeOptions.length > 0 ? (
          <View style={styles.routeOptions}>
            <RouteComparisonMap options={routeOptions} selectedIndex={selectedRouteIndex} onSelect={setSelectedRouteIndex} />
            <Text style={styles.optionsTitle}>Choose a route</Text>
            {routeOptions.map((option, index) => (
              <TouchableOpacity
                key={`route-${index}`}
                style={[styles.routeOption, selectedRouteIndex === index && styles.routeOptionSelected]}
                onPress={() => setSelectedRouteIndex(index)}
                activeOpacity={0.85}
              >
                <View style={[styles.routeRadio, selectedRouteIndex === index && styles.routeRadioSelected]} />
                <View style={styles.routeOptionText}>
                  <Text style={styles.routeOptionTitle}>
                    {index === 0 ? 'Recommended route' : `Alternative ${index}`}
                  </Text>
                  <Text style={styles.routeOptionMeta}>
                    {option.distanceKm > 0 ? `${option.distanceKm} km` : 'Distance unavailable'} · {option.durationMinutes} min
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.startButton} onPress={previewSelectedRoute} activeOpacity={0.85}>
              <Navigation size={20} color={Colors.onPrimary} />
              <Text style={styles.startButtonText}>Preview Selected Route</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.startButton} onPress={() => { void startRoute(); }} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color={Colors.onPrimary} /> : <Navigation size={20} color={Colors.onPrimary} />}
            <Text style={styles.startButtonText}>{loading ? 'Calculating routes...' : 'Find Routes'}</Text>
          </TouchableOpacity>
        )}
      </View>
      </ScrollView>
    </View>
  );
};

function SuggestionList({ suggestions, onSelect }: { suggestions: LocationSuggestion[]; onSelect: (suggestion: LocationSuggestion) => void }) {
  return (
    <View style={styles.suggestions}>
      {suggestions.map((suggestion) => (
        <TouchableOpacity key={`${suggestion.label}-${suggestion.coordinates?.join(',') ?? 'saved'}`} style={styles.suggestion} onPress={() => onSelect(suggestion)}>
          <MapPin size={16} color={Colors.onSurfaceVariant} />
          <Text style={styles.suggestionText} numberOfLines={2}>{suggestion.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerHighest },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceContainerLow },
  titleBlock: { flex: 1, marginLeft: 12 },
  title: { color: Colors.primaryBrand, fontWeight: '700' },
  subtitle: { color: Colors.onSurfaceVariant, marginTop: 2 },
  form: { margin: 20, padding: 18, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceContainerHighest },
  inputGroup: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: Colors.outlineVariant, borderRadius: 12, paddingHorizontal: 12, backgroundColor: Colors.surfaceContainerLow },
  input: { flex: 1, height: 52, color: Colors.onSurface, fontSize: 15 },
  connector: { width: 2, height: 18, marginLeft: 29, backgroundColor: Colors.outlineVariant },
  error: { color: Colors.error, marginTop: 14, lineHeight: 20 },
  routeOptions: { marginTop: 18, gap: 10 },
  comparisonMap: { height: 240, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.surfaceContainerHighest },
  comparisonWebView: { flex: 1, backgroundColor: '#edf2f5' },
  optionsTitle: { color: Colors.onSurface, fontWeight: '700', fontSize: 16 },
  routeOption: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.outlineVariant, backgroundColor: Colors.surfaceContainerLow },
  routeOptionSelected: { borderColor: Colors.primaryBrand, backgroundColor: 'rgba(214, 227, 255, 0.45)' },
  routeRadio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Colors.outline },
  routeRadioSelected: { borderColor: Colors.primaryBrand, backgroundColor: Colors.primaryBrand },
  routeOptionText: { flex: 1 },
  routeOptionTitle: { color: Colors.onSurface, fontWeight: '700', fontSize: 14 },
  routeOptionMeta: { color: Colors.onSurfaceVariant, marginTop: 3, fontSize: 12 },
  suggestions: { marginTop: 4, borderRadius: 12, borderWidth: 1, borderColor: Colors.surfaceContainerHighest, backgroundColor: Colors.surface, overflow: 'hidden' },
  suggestion: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainerLow },
  suggestionText: { flex: 1, color: Colors.onSurface, fontSize: 13, lineHeight: 18 },
  startButton: { marginTop: 20, minHeight: 52, borderRadius: 14, backgroundColor: Colors.primaryBrand, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  startButtonText: { color: Colors.onPrimary, fontWeight: '700', fontSize: 15 },
});
