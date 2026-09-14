import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Rect, G } from 'react-native-svg';
import { Colors, Typography, Spacing } from '../../theme';
import { IMUPoint } from '../../context/NavigationContext';

interface WaveformChartProps {
  title: string;
  frequency?: string;
  data: IMUPoint[];
  channel: 'accel' | 'gyro';
  color?: string;
}

export const WaveformChart: React.FC<WaveformChartProps> = ({
  title,
  frequency = '100Hz',
  data,
  channel,
  color = Colors.secondaryContainer,
}) => {
  const chartHeight = 110;
  const chartWidth = 320;

  // Build SVG path from real-time data
  const points = data.length > 0 ? data : Array.from({ length: 25 }, (_, i) => ({
    time: i,
    accelX: Math.sin(i * 0.4) * 1.5,
    accelY: Math.cos(i * 0.3) * 1.0,
    gyroZ: Math.sin(i * 0.6) * 2.0,
  }));

  const pathData = points
    .map((p, index) => {
      const x = (index / (points.length - 1)) * chartWidth;
      const val = channel === 'accel' ? p.accelX : p.gyroZ;
      // Map [-3, 3] to [chartHeight, 0]
      const y = chartHeight / 2 - (val / 3.5) * (chartHeight / 2);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const secondaryPathData = points
    .map((p, index) => {
      const x = (index / (points.length - 1)) * chartWidth;
      const val = channel === 'accel' ? p.accelY : p.gyroZ * 0.6;
      const y = chartHeight / 2 - (val / 3.5) * (chartHeight / 2);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={[Typography.titleLg, styles.title]}>{title}</Text>
        <View style={styles.badge}>
          <Text style={[Typography.labelSm, styles.badgeText]}>{frequency}</Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {/* Background Grid Pattern */}
          <Rect width={chartWidth} height={chartHeight} fill={Colors.surfaceContainerLowest} />
          <G stroke={Colors.surfaceContainerHighest} strokeWidth={1} strokeDasharray="3 3">
            <Line x1="0" y1={chartHeight / 4} x2={chartWidth} y2={chartHeight / 4} />
            <Line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} />
            <Line x1="0" y1={(3 * chartHeight) / 4} x2={chartWidth} y2={(3 * chartHeight) / 4} />
            <Line x1={chartWidth / 4} y1="0" x2={chartWidth / 4} y2={chartHeight} />
            <Line x1={chartWidth / 2} y1="0" x2={chartWidth / 2} y2={chartHeight} />
            <Line x1={(3 * chartWidth) / 4} y1="0" x2={(3 * chartWidth) / 4} y2={chartHeight} />
          </G>

          {/* Secondary Sub-wave */}
          <Path
            d={secondaryPathData}
            stroke={Colors.primaryContainer}
            strokeWidth={1.5}
            fill="none"
            opacity={0.35}
          />

          {/* Primary Signal Waveform */}
          <Path
            d={pathData}
            stroke={color}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: Colors.onSurface,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  chartWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
});
