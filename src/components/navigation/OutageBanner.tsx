import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff, Activity } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../../theme';

interface OutageBannerProps {
  outageTimeFormatted?: string;
}

export const OutageBanner: React.FC<OutageBannerProps> = ({ outageTimeFormatted }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <WifiOff size={24} color={Colors.secondaryContainer} />
        </View>

        <View style={styles.textContainer}>
          <Text style={[Typography.labelLg, styles.title]}>GNSS SIGNAL LOST</Text>
          <Text style={[Typography.bodySm, styles.subtitle]}>
            Active: AI + INS Dead Reckoning
          </Text>
        </View>

        <View style={styles.statusPill}>
          <View style={styles.pulseDot} />
          <Text style={[Typography.labelSm, styles.statusText]}>STABLE</Text>
          {outageTimeFormatted && (
            <Text style={[Typography.labelSm, styles.timerText]}>{outageTimeFormatted}</Text>
          )}
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
  },
  card: {
    backgroundColor: 'rgba(243, 244, 245, 0.96)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 152, 0, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 152, 0, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.secondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondaryContainer,
  },
  statusText: {
    color: Colors.secondary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerText: {
    color: Colors.secondary,
    fontFamily: 'Courier',
    fontWeight: '700',
  },
});
