import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Route, Timer, Gauge, Cpu, CheckCircle } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../theme';
import { useNavigation } from '../context/NavigationContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TripSummaryScreenProps {
  onDone: () => void;
  completed?: boolean;
}

export const TripSummaryScreen: React.FC<TripSummaryScreenProps> = ({ onDone, completed = true }) => {
  const { tripSummary } = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Titles */}
        <View style={styles.header}>
          <Text style={[Typography.displayLg, styles.title]}>
            {completed ? 'Trip Complete' : 'Trip Ended Early'}
          </Text>
          <Text style={[Typography.bodyMd, styles.subtitle]}>
            {completed
              ? 'Data synced to fleet telemetry and audit log securely.'
              : 'The trip stopped before reaching the selected destination.'}
          </Text>
        </View>

        {/* Traveled Route Map Card */}
        <View style={styles.mapCard}>
          <Svg width="100%" height={180} viewBox="0 0 380 180">
            <Defs>
              <LinearGradient id="summaryRouteGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#0d1c32" />
                <Stop offset="70%" stopColor="#000000" />
                <Stop offset="100%" stopColor={Colors.secondaryContainer} />
              </LinearGradient>
            </Defs>

            {/* Map Canvas Background */}
            <Rect width="380" height="180" fill={Colors.surfaceContainerLow} rx={16} />

            {/* Traveled Path Polyline */}
            <Path
              d="M 40,140 C 90,130 110,60 170,80 S 240,150 290,90 S 330,50 350,40"
              stroke="url(#summaryRouteGrad)"
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Origin Marker */}
            <Circle cx={40} cy={140} r={8} fill={Colors.primaryBrand} stroke="#ffffff" strokeWidth={2.5} />
            {/* Destination Marker (Failover Outage Section Ended) */}
            <Circle cx={350} cy={40} r={8} fill={Colors.secondaryContainer} stroke="#ffffff" strokeWidth={2.5} />
          </Svg>
        </View>

        {/* Primary Stats Bento Grid */}
        <View style={styles.statsGrid}>
          {/* Total Distance (Full Width) */}
          <View style={styles.prominentCard}>
            <View>
              <Text style={[Typography.labelSm, styles.statLabel]}>TOTAL DISTANCE</Text>
              <Text style={[Typography.displayLg, styles.distanceValue]}>
                {tripSummary.totalDistanceKm} <Text style={styles.unitText}>km</Text>
              </Text>
            </View>
            <View style={styles.distanceIconCircle}>
              <Route size={26} color={Colors.primaryBrand} />
            </View>
          </View>

          {/* Time & Speed Row */}
          <View style={styles.statsRow}>
            {/* Total Time */}
            <View style={styles.smallStatCard}>
              <View style={styles.smallStatHeader}>
                <Timer size={16} color={Colors.onSurfaceVariant} />
                <Text style={[Typography.labelSm, styles.statLabel]}>TIME</Text>
              </View>
              <Text style={[Typography.headlineLgMobile, styles.smallStatValue]}>
                {tripSummary.totalDurationMin} <Text style={styles.smallUnitText}>min</Text>
              </Text>
            </View>

            {/* Avg Speed */}
            <View style={styles.smallStatCard}>
              <View style={styles.smallStatHeader}>
                <Gauge size={16} color={Colors.onSurfaceVariant} />
                <Text style={[Typography.labelSm, styles.statLabel]}>AVG SPEED</Text>
              </View>
              <Text style={[Typography.headlineLgMobile, styles.smallStatValue]}>
                {tripSummary.avgSpeedKmh} <Text style={styles.smallUnitText}>km/h</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Technical Diagnostics Section */}
        <View style={styles.diagnosticsSection}>
          <Text style={[Typography.titleLg, styles.diagnosticsTitle]}>
            Technical Diagnostics
          </Text>

          <View style={styles.diagnosticsGrid}>
            {/* GNSS Availability */}
            <View style={styles.diagnosticCard}>
              <Text style={[Typography.labelSm, styles.diagLabel]}>GNSS Availability</Text>
              <View style={styles.diagValueRow}>
                <Text style={[Typography.headlineLgMobile, styles.diagValue]}>
                  {tripSummary.gnssAvailabilityPercent}%
                </Text>
                <View style={styles.greenDot} />
              </View>
            </View>

            {/* GNSS Outage Duration */}
            <View style={styles.diagnosticCard}>
              <Text style={[Typography.labelSm, styles.diagLabel]}>GNSS Outage</Text>
              <Text style={[Typography.headlineLgMobile, styles.diagValue]}>
                {tripSummary.outageDurationFormatted}
              </Text>
            </View>

            {/* AI + INS Active Insight Card */}
            <View style={styles.aiInsightCard}>
              <View style={styles.aiLeft}>
                <View style={styles.aiHeader}>
                  <Cpu size={16} color={Colors.secondary} />
                  <Text style={[Typography.labelSm, styles.aiLabel]}>AI + INS Active</Text>
                </View>
                <Text style={[Typography.headlineLgMobile, styles.aiValue]}>
                  {tripSummary.aiInsActiveFormatted}
                </Text>
              </View>

              <View style={styles.aiRight}>
                <Text style={[Typography.labelSm, styles.aiDriftLabel]}>Estimated Drift</Text>
                <Text style={[Typography.headlineLgMobile, styles.aiValue]}>
                  {tripSummary.finalDriftMeters}m
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Done Action Button */}
        <TouchableOpacity style={styles.doneButton} onPress={onDone} activeOpacity={0.85}>
          <Text style={[Typography.labelLg, styles.doneButtonText]}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.containerPadding,
    paddingBottom: 40,
  },
  header: {
    marginTop: Spacing.stackMd,
    marginBottom: Spacing.stackMd,
  },
  title: {
    color: Colors.primaryBrand,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  mapCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    backgroundColor: Colors.surface,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  prominentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statLabel: {
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
    fontWeight: '700',
    fontSize: 10,
  },
  distanceValue: {
    color: Colors.primaryBrand,
    fontWeight: '800',
    marginTop: 4,
  },
  unitText: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  distanceIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(214, 227, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallStatCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  smallStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  smallStatValue: {
    color: Colors.primaryBrand,
    fontWeight: '700',
  },
  smallUnitText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
  },
  diagnosticsSection: {
    marginBottom: 28,
  },
  diagnosticsTitle: {
    color: Colors.primaryBrand,
    fontWeight: '700',
    marginBottom: 14,
  },
  diagnosticsGrid: {
    gap: 12,
  },
  diagnosticCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  diagLabel: {
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  diagValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diagValue: {
    color: Colors.primaryBrand,
    fontWeight: '700',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
  },
  aiInsightCard: {
    backgroundColor: 'rgba(255, 152, 0, 0.12)',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.secondaryContainer,
  },
  aiLeft: {
    flex: 1,
  },
  aiRight: {
    alignItems: 'flex-end',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  aiLabel: {
    color: Colors.secondary,
    fontWeight: '700',
  },
  aiValue: {
    color: Colors.onSecondaryFixedVariant,
    fontWeight: '700',
  },
  aiDriftLabel: {
    color: Colors.secondary,
    opacity: 0.85,
    marginBottom: 4,
  },
  doneButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonText: {
    color: Colors.onPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
});
