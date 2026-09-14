import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { ShieldCheck, Cpu, Navigation, ArrowRight } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../theme';

const SLIDES = [
  {
    id: '1',
    title: 'Uninterrupted Navigation Everywhere',
    description:
      'Never lose your route. NavGuard seamlessly sustains position tracking in tunnels, deep urban canyons, and GNSS-jammed environments.',
    icon: ShieldCheck,
    accent: '#4caf50',
  },
  {
    id: '2',
    title: 'AI + Inertial Dead Reckoning',
    description:
      'High-frequency 100Hz IMU accelerometers, gyroscopes, and computer vision keep you on course with sub-meter drift accuracy.',
    icon: Cpu,
    accent: Colors.secondaryContainer,
  },
  {
    id: '3',
    title: 'Automotive-Grade Precision',
    description:
      'Engineered for critical transit, fleet management, and drivers demanding zero downtime navigation safety.',
    icon: Navigation,
    accent: Colors.primaryFixed,
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: currentIndex * screenWidth, animated: false });
  }, [screenWidth]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / screenWidth);
    if (pageIndex !== currentIndex && pageIndex >= 0 && pageIndex < SLIDES.length) {
      setCurrentIndex(pageIndex);
    }
  };

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * screenWidth, animated: true });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Skip */}
      <View style={styles.header}>
        <Text style={[Typography.labelLg, styles.brandText]}>NavGuard</Text>
        {currentIndex < SLIDES.length - 1 ? (
          <TouchableOpacity onPress={onComplete} activeOpacity={0.7} style={styles.skipBtn}>
            <Text style={[Typography.labelLg, styles.skipText]}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Horizontal Swipeable Slides Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {SLIDES.map((slide) => {
          const IconComponent = slide.icon;
          return (
            <ScrollView key={slide.id} style={{ width: screenWidth }} contentContainerStyle={styles.slidePage} showsVerticalScrollIndicator={false}>
              <View style={[styles.iconWrapper, { borderColor: slide.accent }]}>
                <IconComponent size={64} color={slide.accent} strokeWidth={2} />
              </View>

              <Text style={[Typography.headlineLg, styles.title]}>{slide.title}</Text>
              <Text style={[Typography.bodyLg, styles.description]}>{slide.description}</Text>
            </ScrollView>
          );
        })}
      </ScrollView>

      {/* Footer Controls (Pagination & Action Button) */}
      <View style={styles.footer}>
        {/* Pagination Dots with tap-to-navigate */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToSlide(index)}
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
            >
              <View
                style={[
                  styles.dot,
                  index === currentIndex ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={[Typography.labelLg, styles.actionButtonText]}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <ArrowRight size={20} color={Colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: Spacing.containerPadding,
  },
  brandText: {
    color: Colors.primaryBrand,
    fontWeight: '800',
    fontSize: 18,
  },
  skipBtn: {
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  skipText: {
    color: Colors.onSurfaceVariant,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'stretch',
  },
  slidePage: {
    flexGrow: 1,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.containerPadding,
  },
  iconWrapper: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    width: '100%',
    maxWidth: 480,
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    width: '100%',
    maxWidth: 480,
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    gap: 16,
    paddingTop: 12,
    paddingHorizontal: Spacing.containerPadding,
    paddingBottom: 28,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 28,
    backgroundColor: Colors.primaryContainer,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  actionButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: Colors.onPrimary,
    fontWeight: '700',
  }
});
