import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';
import { useNavigation } from '../../context/NavigationContext';

interface MetricsSheetProps {
  onEndTrip?: () => void;
  actionLabel?: string;
}

export const MetricsSheet: React.FC<MetricsSheetProps> = ({ onEndTrip, actionLabel = 'End Trip' }) => {
  const {
    timeRemainingMinutes,
    etaString,
    distanceRemainingKm,
    currentSpeedKmh,
    navigationMode,
    positionConfidence,
    driftRatePerKm,
  } = useNavigation();

  const isOutage = navigationMode === 'AI_INS_DR';

  return (
    <View style={styles.container}>
      {/* Drawer Handle */}
      <View style={styles.handle} />

      {/* Primary Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={[Typography.headlineLg, styles.timeValue, isOutage && styles.outageValue]}>
            {timeRemainingMinutes} min
          </Text>
          <Text style={[Typography.bodySm, styles.metricLabel]}>
            Arriving by {etaString}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItemCenter}>
          <Text style={[Typography.headlineLg, styles.numberValue]}>
            {distanceRemainingKm} <Text style={styles.unitText}>km</Text>
          </Text>
          <Text style={[Typography.labelSm, styles.subLabel]}>TO GO</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItemRight}>
          <Text style={[Typography.headlineLg, styles.numberValue]}>
            {currentSpeedKmh} <Text style={styles.unitText}>km/h</Text>
          </Text>
          <Text style={[Typography.labelSm, styles.subLabel]}>CRUISING AT</Text>
        </View>
      </View>

      {/* Outage Dead-Reckoning Health Details */}
      {isOutage && (
        <View style={styles.drStatsContainer}>
          <View style={styles.drRow}>
            <Text style={[Typography.labelSm, styles.drLabel]}>POSITION CONFIDENCE</Text>
            <Text style={[Typography.labelSm, styles.drConfidenceText]}>
              {Math.round(positionConfidence)}%
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${positionConfidence}%` }]} />
          </View>
          <View style={styles.drMetaRow}>
            <Text style={[Typography.labelSm, styles.drMeta]}>Drift: {driftRatePerKm}</Text>
            <Text style={[Typography.labelSm, styles.drMeta]}>Sensors: IMU + Visual Odom</Text>
          </View>
        </View>
      )}

      {/* End Trip Action */}
      {onEndTrip && (
        <TouchableOpacity
          style={[styles.endButton, isOutage && styles.endButtonOutage]}
          onPress={onEndTrip}
          activeOpacity={0.85}
        >
          <Text style={[Typography.labelLg, styles.endButtonText]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(13, 28, 50, 0.96)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: 10,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  metricItem: {
    flex: 1.2,
  },
  metricItemCenter: {
    flex: 1,
    alignItems: 'center',
  },
  metricItemRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: 8,
  },
  timeValue: {
    color: Colors.tertiaryFixed,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  outageValue: {
    color: Colors.secondaryContainer,
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 2,
  },
  numberValue: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  subLabel: {
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  drStatsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  drRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  drLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.5,
  },
  drConfidenceText: {
    color: Colors.secondaryContainer,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.secondaryContainer,
    borderRadius: 3,
  },
  drMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  drMeta: {
    color: 'rgba(255, 255, 255, 0.45)',
  },
  endButton: {
    marginTop: 14,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  endButtonOutage: {
    backgroundColor: Colors.error,
  },
  endButtonText: {
    color: Colors.onError,
    fontWeight: '700',
  },
});
