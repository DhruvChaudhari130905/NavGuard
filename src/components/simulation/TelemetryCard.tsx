import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';

interface TelemetryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  progress?: number; // 0 - 100
  accentColor?: string;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  icon,
  label,
  value,
  unit,
  subtext,
  progress,
  accentColor = Colors.secondaryContainer,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon}
        <Text style={[Typography.labelLg, styles.label]}>{label}</Text>
      </View>

      <View style={styles.valueRow}>
        <Text style={[Typography.displayLg, styles.value]}>{value}</Text>
        {unit && <Text style={[Typography.titleLg, styles.unit]}>{unit}</Text>}
      </View>

      {progress !== undefined && (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: accentColor },
            ]}
          />
        </View>
      )}

      {subtext && <Text style={[Typography.labelSm, styles.subtext]}>{subtext}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.gutter,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 8,
    gap: 4,
  },
  value: {
    color: Colors.onSurface,
    fontWeight: '700',
    letterSpacing: -1,
  },
  unit: {
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  subtext: {
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    textAlign: 'right',
  },
});
