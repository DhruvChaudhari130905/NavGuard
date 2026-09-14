import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Animated, Easing } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors, Typography } from '../theme';


interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Keep the branded loading screen visible long enough to be noticed.
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 4000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start(() => {
      if (onFinish) {
        onFinish();
      }
    });
  }, [onFinish, progressAnim]);

  const lineWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.primaryBrand }} contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryBrand} />

      {/* Branded Logo Graphic */}
      <View style={styles.logoWrapper}>
        <Svg width={120} height={120} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#d6e3ff" />
              <Stop offset="100%" stopColor="#4caf50" />
            </LinearGradient>
          </Defs>

          {/* Shield Outer Outline */}
          <Path
            d="M 50,10 L 85,25 C 85,60 50,90 50,90 C 50,90 15,60 15,25 Z"
            fill="none"
            stroke="url(#logoGrad)"
            strokeWidth={4}
          />

          {/* Navigation Arrow / Compass Vector */}
          <Path
            d="M 50,26 L 68,68 L 50,56 L 32,68 Z"
            fill={Colors.secondaryContainer}
            stroke="#ffffff"
            strokeWidth={1.5}
          />

          {/* Satellite Orbit Halo */}
          <Circle cx={50} cy={50} r={38} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="4 4" />
          <Circle cx={76} cy={24} r={4} fill={Colors.tertiaryFixed} />
        </Svg>
      </View>

      <Text style={[Typography.displayLg, styles.brandName]}>NavGuard</Text>

      {/* Animated Motion Line below NavGuard */}
      <View style={styles.brandUnderlineTrack}>
        <Animated.View style={[styles.brandUnderlineBar, { width: lineWidth }]} />
      </View>

      <Text style={[Typography.bodyLg, styles.tagline]}>
        Resilient GNSS & AI Dead Reckoning
      </Text>

      {/* Loading Indicator */}
      <View style={styles.footer}>
        <View style={styles.loadingTrack}>
          <Animated.View style={[styles.loadingBar, { width: lineWidth }]} />
        </View>
        <Text style={[Typography.labelSm, styles.footerText]}>
          INITIALIZING SENSOR FUSION ENGINE...
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.primaryBrand,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoWrapper: {
    marginBottom: 24,
    shadowColor: Colors.tertiaryFixed,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  brandName: {
    color: '#ffffff',
    letterSpacing: -1,
    fontWeight: '800',
  },
  brandUnderlineTrack: {
    width: 160,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
  },
  brandUnderlineBar: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 2,
  },
  tagline: {
    color: Colors.primaryFixedDim,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 400,
    width: '100%',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    width: '100%',
  },
  loadingTrack: {
    width: 140,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  loadingBar: {
    height: '100%',
    backgroundColor: Colors.secondaryContainer,
    borderRadius: 2,
  },
  footerText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
});
