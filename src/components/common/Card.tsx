import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'outlined',
}) => {
  return (
    <View style={[styles.baseCard, styles[variant], style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  baseCard: {
    borderRadius: Spacing.borderRadius.card,
    padding: Spacing.containerPadding,
    overflow: 'hidden',
  },
  outlined: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  elevated: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  filled: {
    backgroundColor: Colors.surfaceContainerLow,
  },
});
