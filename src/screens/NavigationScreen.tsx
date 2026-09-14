import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, ShieldAlert, ShieldCheck } from 'lucide-react-native';
import { Colors, Typography } from '../theme';
import { useNavigation } from '../context/NavigationContext';
import { ExpoMapView as MapView } from '../components/navigation/ExpoMapView';
import { MetricsSheet } from '../components/navigation/MetricsSheet';

interface NavigationScreenProps {
  onBack: () => void;
  onFinishTrip: () => void;
  inTabMode?: boolean;
  mapOnly?: boolean;
}

export const NavigationScreen: React.FC<NavigationScreenProps> = ({ onBack, onFinishTrip, inTabMode = false, mapOnly = false }) => {
  const {
    navigationMode,
    isInsideBlackoutZone,
    toggleGnssSignal,
    stopNavigation,
    beginNavigation,
    isNavigating,
    routeProgress,
  } = useNavigation();
  const hasFinishedRef = useRef(false);

  const isOutage = isInsideBlackoutZone || navigationMode === 'AI_INS_DR';

  const handleEndTrip = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    stopNavigation();
    onFinishTrip();
  };

  useEffect(() => {
    if (routeProgress >= 1) {
      handleEndTrip();
    }
  }, [routeProgress]);

  return (
    <View style={[styles.container, inTabMode && styles.containerTab]}>
      {mapOnly ? (
        <>
          <View style={styles.fullMap}>
            <MapView showRoute={false} />
          </View>
          <TouchableOpacity style={styles.mapOnlyBackButton} onPress={onBack} activeOpacity={0.8}>
            <ArrowLeft size={20} color={Colors.onSurface} />
            <Text style={styles.mapOnlyBackText}>Head to Main Screen</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={22} color={Colors.onSurface} />
        </TouchableOpacity>

        <View style={styles.titleColumn}>
          <Text style={[Typography.titleLg, styles.headerTitle]}>
            {isOutage ? 'NavGuard (AI Dead Reckoning)' : 'NavGuard (GNSS Navigation)'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isOutage ? '⚠️ GNSS blocked · AI + INS position estimation' : 'Constellation: 18 Satellites Locked'}
          </Text>
        </View>

        {/* Quick Jammer / Outage Simulation Toggle */}
        <TouchableOpacity
          style={[styles.simToggleButton, isOutage ? styles.simToggleActive : styles.simToggleInactive]}
          onPress={() => toggleGnssSignal()}
          activeOpacity={0.8}
        >
          {isOutage ? (
            <ShieldAlert size={16} color={Colors.secondaryContainer} />
          ) : (
            <ShieldCheck size={16} color="#4caf50" />
          )}
          <Text style={[Typography.labelSm, isOutage ? styles.simTextActive : styles.simTextInactive]}>
            {isOutage ? 'RESTORE GNSS' : 'SIM OUTAGE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Big Map Canvas Viewport */}
      <View style={styles.mapArea}>
        <MapView />
      </View>

      {/* Bottom Live Metrics Sheet */}
      <MetricsSheet
        actionLabel={isNavigating ? 'End Trip' : 'Start Navigation'}
        onEndTrip={isNavigating ? handleEndTrip : beginNavigation}
      />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  containerTab: {
    paddingBottom: 76, // Height of bottom navigation bar
  },
  topHeader: {
    minHeight: 60,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHighest,
    zIndex: 40,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    flexShrink: 0,
  },
  titleColumn: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
    justifyContent: 'center',
  },
  headerTitle: {
    color: Colors.primaryBrand,
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 17,
  },
  headerSubtitle: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 14,
  },
  simToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
  },
  simToggleActive: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderColor: 'rgba(255, 152, 0, 0.4)',
  },
  simToggleInactive: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  simTextActive: {
    color: Colors.secondary,
    fontWeight: '700',
    fontSize: 10,
  },
  simTextInactive: {
    color: '#2e7d32',
    fontWeight: '700',
    fontSize: 10,
  },
  mapArea: {
    flex: 1,
    position: 'relative',
  },
  fullMap: {
    flex: 1,
  },
  mapOnlyBackButton: {
    position: 'absolute',
    top: 16,
    left: 14,
    minWidth: 42,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    zIndex: 50,
    elevation: 5,
  },
  mapOnlyBackText: {
    marginLeft: 8,
    color: Colors.onSurface,
    fontSize: 13,
    fontWeight: '700',
  },
});
