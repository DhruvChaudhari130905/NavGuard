import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { ArrowLeft, AlertTriangle, Activity, Satellite, CheckCircle2 } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../theme';
import { useNavigation } from '../context/NavigationContext';
import { WaveformChart } from '../components/simulation/WaveformChart';
import { TelemetryCard } from '../components/simulation/TelemetryCard';

interface DemoConsoleScreenProps {
  onBack: () => void;
}

export const DemoConsoleScreen: React.FC<DemoConsoleScreenProps> = ({ onBack }) => {
  const {
    isGnssSignalOn,
    toggleGnssSignal,
    formattedOutageTimer,
    estimatedDriftMeters,
    positionConfidence,
    imuTelemetry,
  } = useNavigation();

  const isOutage = !isGnssSignalOn;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={[Typography.titleLg, styles.headerTitle]}>GNSS Simulation Console</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Toggle Control Card */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleInfo}>
            <Text style={[Typography.titleLg, styles.toggleTitle]}>Environmental Jamming</Text>
            <Text style={[Typography.bodySm, styles.toggleSubtitle]}>
              Simulate tunnel blackout or RF spoofing
            </Text>
          </View>

          <View style={styles.switchWrapper}>
            <Text style={[Typography.labelSm, styles.switchLabel, isOutage ? styles.labelOff : styles.labelOn]}>
              GNSS {isGnssSignalOn ? 'ON' : 'OFF'}
            </Text>
            <Switch
              value={!isGnssSignalOn}
              onValueChange={(val) => toggleGnssSignal(!val)}
              trackColor={{ false: Colors.primaryContainer, true: Colors.error }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {isOutage ? (
          /* OUTAGE ACTIVE TELEMETRY */
          <View style={styles.outageSection}>
            {/* Critical Alert Banner with Live Outage Timer */}
            <View style={styles.alertBanner}>
              <View style={styles.alertLeft}>
                <AlertTriangle size={28} color={Colors.error} />
                <View style={styles.alertTextBlock}>
                  <Text style={[Typography.titleLg, styles.alertTitle]}>Signal Lost</Text>
                  <Text style={[Typography.bodySm, styles.alertSubtitle]}>
                    Switching to Dead Reckoning via AI + INS
                  </Text>
                </View>
              </View>

              <View style={styles.timerBox}>
                <Text style={[Typography.labelSm, styles.timerLabel]}>DURATION</Text>
                <Text style={[Typography.headlineLg, styles.timerValue]}>{formattedOutageTimer}</Text>
              </View>
            </View>

            {/* Telemetry Bento Grid */}
            <View style={styles.telemetryGrid}>
              {/* Active Chip */}
              <View style={styles.activeChipCard}>
                <View style={styles.pulseDot} />
                <Text style={[Typography.headlineLgMobile, styles.activeChipTitle]}>
                  AI + INS{'\n'}ACTIVE
                </Text>
                <Text style={[Typography.labelSm, styles.activeChipSubtitle]}>
                  Inertial Nav System
                </Text>
              </View>

              {/* Estimated Drift */}
              <View style={styles.metricCard}>
                <Text style={[Typography.labelSm, styles.metricHeader]}>ESTIMATED DRIFT</Text>
                <View style={styles.metricValueRow}>
                  <Text style={[Typography.displayLg, styles.metricNum]}>{estimatedDriftMeters}</Text>
                  <Text style={[Typography.titleLg, styles.metricUnit]}>m</Text>
                </View>
                <View style={styles.driftTrack}>
                  <View style={[styles.driftBar, { width: `${Math.min(100, (estimatedDriftMeters / 15) * 100)}%` }]} />
                </View>
                <Text style={[Typography.labelSm, styles.metricFootnote]}>Limit: 15.0m</Text>
              </View>

              {/* Confidence */}
              <View style={styles.metricCard}>
                <Text style={[Typography.labelSm, styles.metricHeader]}>MODEL CONFIDENCE</Text>
                <View style={styles.metricValueRow}>
                  <Text style={[Typography.displayLg, styles.metricNum, { color: '#32963b' }]}>
                    {Math.round(positionConfidence)}
                  </Text>
                  <Text style={[Typography.titleLg, styles.metricUnit]}>%</Text>
                </View>
                <View style={styles.driftTrack}>
                  <View style={[styles.confidenceBar, { width: `${positionConfidence}%` }]} />
                </View>
                <Text style={[Typography.labelSm, styles.metricFootnote]}>High Confidence</Text>
              </View>
            </View>

            {/* 100Hz Real-Time Sensor Waveforms */}
            <View style={styles.waveformsSection}>
              <WaveformChart
                title="IMU: Accelerometer (3-Axis)"
                frequency="100Hz"
                data={imuTelemetry}
                channel="accel"
                color={Colors.secondaryContainer}
              />
              <WaveformChart
                title="IMU: Gyroscope (Angular Rate)"
                frequency="100Hz"
                data={imuTelemetry}
                channel="gyro"
                color="#4caf50"
              />
            </View>
          </View>
        ) : (
          /* OPTIMAL GNSS STATE */
          <View style={styles.optimalSection}>
            <View style={styles.optimalIconCircle}>
              <Satellite size={54} color="#4caf50" />
            </View>
            <Text style={[Typography.headlineLg, styles.optimalTitle]}>GNSS Signal Optimal</Text>
            <Text style={[Typography.bodyLg, styles.optimalSubtitle]}>
              The receiver is tracking 18 healthy constellation satellites. Toggle the switch above to trigger simulated GNSS outage and observe the AI+INS failover.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.gutter,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHighest,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },
  headerTitle: {
    color: Colors.onSurface,
    fontWeight: '700',
    fontSize: 16,
  },
  scrollContent: {
    padding: Spacing.containerPadding,
    paddingBottom: 40,
    gap: 20,
  },
  toggleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
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
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    color: Colors.onSurface,
    fontSize: 16,
    fontWeight: '700',
  },
  toggleSubtitle: {
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  switchLabel: {
    fontWeight: '800',
    fontSize: 11,
  },
  labelOn: {
    color: Colors.primaryContainer,
  },
  labelOff: {
    color: Colors.error,
  },
  outageSection: {
    gap: 20,
  },
  alertBanner: {
    backgroundColor: Colors.errorContainer,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.25)',
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  alertTextBlock: {
    flex: 1,
    flexShrink: 1,
  },
  alertTitle: {
    color: Colors.error,
    fontWeight: '700',
  },
  alertSubtitle: {
    color: Colors.onErrorContainer,
    marginTop: 2,
    lineHeight: 16,
  },
  timerBox: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  timerLabel: {
    color: Colors.error,
    letterSpacing: 0.5,
  },
  timerValue: {
    color: Colors.onErrorContainer,
    fontFamily: 'Courier',
    fontWeight: '800',
    fontSize: 24,
    lineHeight: 28,
  },
  telemetryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  activeChipCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 152, 0, 0.12)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.secondaryContainer,
    marginBottom: 8,
  },
  activeChipTitle: {
    color: Colors.secondary,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 14,
    lineHeight: 18,
  },
  activeChipSubtitle: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    marginTop: 6,
  },
  metricCard: {
    flex: 1.1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    justifyContent: 'space-between',
  },
  metricHeader: {
    color: Colors.onSurfaceVariant,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginVertical: 6,
  },
  metricNum: {
    color: Colors.onSurface,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '700',
  },
  metricUnit: {
    color: Colors.onSurfaceVariant,
    fontSize: 14,
  },
  driftTrack: {
    height: 4,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 2,
    overflow: 'hidden',
  },
  driftBar: {
    height: '100%',
    backgroundColor: Colors.secondaryContainer,
    borderRadius: 2,
  },
  confidenceBar: {
    height: '100%',
    backgroundColor: '#32963b',
    borderRadius: 2,
  },
  metricFootnote: {
    color: Colors.onSurfaceVariant,
    fontSize: 9,
    marginTop: 6,
    textAlign: 'right',
  },
  waveformsSection: {
    gap: 16,
  },
  optimalSection: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  optimalIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  optimalTitle: {
    color: Colors.onSurface,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 12,
  },
  optimalSubtitle: {
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 15,
  },
});
