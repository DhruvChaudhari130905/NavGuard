import { TextStyle } from 'react-native';

export const Typography: Record<string, TextStyle> = {
  displayLg: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '700',
    letterSpacing: -0.88,
  },
  headlineLg: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.32,
  },
  headlineLgMobile: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
  },
  titleLg: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
  },
  bodyLg: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '400',
  },
  bodyMd: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodySm: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  labelLg: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  labelSm: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
};
