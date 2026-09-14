import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography } from '../../theme';

interface StatusBadgeProps {
  label: string;
  variant?: 'healthy' | 'warning' | 'error' | 'neutral';
  showPulse?: boolean;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'healthy',
  showPulse = true,
  style,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'warning':
        return {
          bg: 'rgba(255, 152, 0, 0.15)',
          text: Colors.secondaryContainer,
          dot: Colors.secondaryContainer,
          border: 'rgba(255, 152, 0, 0.3)',
        };
      case 'error':
        return {
          bg: Colors.errorContainer,
          text: Colors.error,
          dot: Colors.error,
          border: 'rgba(186, 26, 26, 0.3)',
        };
      case 'neutral':
        return {
          bg: Colors.surfaceContainerHigh,
          text: Colors.onSurfaceVariant,
          dot: Colors.outline,
          border: Colors.outlineVariant,
        };
      case 'healthy':
      default:
        return {
          bg: 'rgba(76, 175, 80, 0.15)',
          text: Colors.tertiaryFixedDim,
          dot: '#4caf50',
          border: 'rgba(76, 175, 80, 0.3)',
        };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg, borderColor: colors.border }, style]}>
      {showPulse && <View style={[styles.dot, { backgroundColor: colors.dot }]} />}
      <Text style={[Typography.labelSm, styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
