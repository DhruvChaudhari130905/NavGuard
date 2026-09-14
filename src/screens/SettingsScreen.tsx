import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { CloudDownload, Cpu, ChevronRight, HardDrive } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing } from '../theme';
import { Header } from '../components/common/Header';

interface SettingsScreenProps {
  onOpenDemo?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onOpenDemo }) => {
  const [audioVoiceAlerts, setAudioVoiceAlerts] = useState(true);
  const [highRateSensors, setHighRateSensors] = useState(true);
  const [visualOdometry, setVisualOdometry] = useState(true);

  // Load settings from async storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const audioVoiceAlertsValue = await AsyncStorage.getItem('audioVoiceAlerts');
        const highRateSensorsValue = await AsyncStorage.getItem('highRateSensors');
        const visualOdometryValue = await AsyncStorage.getItem('visualOdometry');

        if (audioVoiceAlertsValue !== null) {
          setAudioVoiceAlerts(audioVoiceAlertsValue === 'true');
        }
        if (highRateSensorsValue !== null) {
          setHighRateSensors(highRateSensorsValue === 'true');
        }
        if (visualOdometryValue !== null) {
          setVisualOdometry(visualOdometryValue === 'true');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Settings" showProfile={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Offline Maps Section */}
        <View style={styles.section}>
          <Text style={[Typography.titleLg, styles.sectionTitle]}>Offline Navigation Data</Text>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.iconCircle}>
                <HardDrive size={22} color={Colors.primaryBrand} />
              </View>
              <View style={styles.rowText}>
                <Text style={[Typography.titleLg, styles.rowTitle]}>Pune City & PCMC</Text>
                <Text style={[Typography.bodySm, styles.rowSubtitle]}>
                  Vector tiles, elevation & offline 3D mesh for Pune (1.4 GB)
                </Text>
              </View>
              <View style={styles.badgeDownloaded}>
                <Text style={styles.badgeDownloadedText}>ACTIVE</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.downloadMoreBtn} activeOpacity={0.8} onPress={() => {
              alert('Region download functionality coming soon!');
            }} accessibilityLabel="Download Additional Region">
              <CloudDownload size={18} color={Colors.primaryBrand} />
              <Text style={[Typography.labelLg, styles.downloadMoreText]}>
                Download Additional Region
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI & Dead Reckoning Sensor Configuration */}
        <View style={styles.section}>
          <Text style={[Typography.titleLg, styles.sectionTitle]}>AI & Inertial Fusion</Text>

          <View style={styles.settingsGroup}>
            <View style={styles.settingItem}>
              <View style={styles.settingTextCol}>
                <Text style={[Typography.titleLg, styles.settingName]}>100Hz High-Rate IMU</Text>
                <Text style={[Typography.bodySm, styles.settingDesc]}>
                  Maximizes acceleration & gyro sampling accuracy during outage
                </Text>
              </View>
              <Switch
                value={highRateSensors}
                onValueChange={async (value) => {
                  setHighRateSensors(value);
                  try {
                    await AsyncStorage.setItem('highRateSensors', value.toString());
                  } catch (error) {
                    console.error('Failed to save high rate sensors setting:', error);
                  }
                }}
                trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primaryContainer }}
                thumbColor="#fff"
                accessibilityState={{ checked: highRateSensors }}
                accessibilityLabel="100Hz High-Rate IMU"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingTextCol}>
                <Text style={[Typography.titleLg, styles.settingName]}>Optical Flow Assist</Text>
                <Text style={[Typography.bodySm, styles.settingDesc]}>
                  Uses lane texture tracking to prevent velocity drift
                </Text>
              </View>
              <Switch
                value={visualOdometry}
                onValueChange={async (value) => {
                  setVisualOdometry(value);
                  try {
                    await AsyncStorage.setItem('visualOdometry', value.toString());
                  } catch (error) {
                    console.error('Failed to save visual odometry setting:', error);
                  }
                }}
                trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primaryContainer }}
                thumbColor="#fff"
                accessibilityState={{ checked: visualOdometry }}
                accessibilityLabel="Optical Flow Assist"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingTextCol}>
                <Text style={[Typography.titleLg, styles.settingName]}>Audio Outage Cues</Text>
                <Text style={[Typography.bodySm, styles.settingDesc]}>
                  Vocal announcements when switching to Dead Reckoning
                </Text>
              </View>
              <Switch
                value={audioVoiceAlerts}
                onValueChange={async (value) => {
                  setAudioVoiceAlerts(value);
                  try {
                    await AsyncStorage.setItem('audioVoiceAlerts', value.toString());
                  } catch (error) {
                    console.error('Failed to save audio voice alerts setting:', error);
                  }
                }}
                trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primaryContainer }}
                thumbColor="#fff"
                accessibilityState={{ checked: audioVoiceAlerts }}
                accessibilityLabel="Audio Outage Cues"
              />
            </View>
          </View>
        </View>

        {/* Developer & Hackathon Demo Console */}
        {onOpenDemo && (
          <TouchableOpacity style={styles.devCard} onPress={onOpenDemo} activeOpacity={0.85} accessibilityLabel="GNSS Spoofing & Sim Console">
            <View style={styles.devLeft}>
              <Cpu size={24} color={Colors.secondaryContainer} />
              <View>
                <Text style={[Typography.titleLg, styles.devTitle]}>GNSS Spoofing & Sim Console</Text>
                <Text style={[Typography.bodySm, styles.devSubtitle]}>
                  Test instant GNSS cutouts, live waveforms & telemetry
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.secondaryContainer} />
          </TouchableOpacity>
        )}

        {/* App Info Footer */}
        <View style={styles.footer}>
          <Text style={[Typography.labelSm, styles.versionText]}>NavGuard v1.0.0 (Production Release)</Text>
          <Text style={[Typography.labelSm, styles.copyrightText]}>
            Engineered with Material 3 & Google Stitch Design System
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.containerPadding,
    paddingBottom: 110,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: Colors.onSurface,
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    color: Colors.onSurface,
    fontSize: 15,
    fontWeight: '700',
  },
  rowSubtitle: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 2,
  },
  badgeDownloaded: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeDownloadedText: {
    color: '#32963b',
    fontWeight: '800',
    fontSize: 10,
  },
  downloadMoreBtn: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  downloadMoreText: {
    color: Colors.primaryBrand,
    fontWeight: '600',
  },
  settingsGroup: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
    gap: 12,
  },
  settingTextCol: {
    flex: 1,
  },
  settingName: {
    color: Colors.onSurface,
    fontSize: 15,
    fontWeight: '600',
  },
  settingDesc: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  devCard: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.secondaryContainer,
  },
  devLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  devTitle: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: '700',
  },
  devSubtitle: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  versionText: {
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  copyrightText: {
    color: Colors.outline,
    marginTop: 2,
    fontSize: 10,
  },
});
