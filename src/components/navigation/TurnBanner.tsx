import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CornerUpLeft } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../../theme';
import { useNavigation } from '../../context/NavigationContext';

export const TurnBanner: React.FC = () => {
  const { nextTurnInstruction, nextTurnDistance, nextTurnStreet } = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <CornerUpLeft size={28} color={Colors.onSecondary} strokeWidth={2.5} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[Typography.headlineLgMobile, styles.instruction]}>
            {nextTurnInstruction}
          </Text>
          <Text style={[Typography.bodyMd, styles.street]}>
            {nextTurnDistance} {nextTurnStreet}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.gutter,
    marginTop: 12,
    zIndex: 30,
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
  },
  instruction: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  street: {
    color: Colors.onPrimaryContainer,
    marginTop: 2,
  },
});
