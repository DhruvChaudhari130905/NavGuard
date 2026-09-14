import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { MapPin, Activity, Bell, CheckCircle2 } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../theme';

interface PermissionsScreenProps {
  onComplete: () => void;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({ onComplete }) => {
  const [permissions, setPermissions] = useState({
    location: true,
    motion: true,
    notifications: false,
  });

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={[Typography.headlineLg, styles.title]}>Setup & Permissions</Text>
        <Text style={[Typography.bodyMd, styles.subtitle]}>
          NavGuard requires real-time sensor and location telemetry to run the AI failover model.
        </Text>
      </View>

      {/* Permissions List */}
      <View style={styles.list}>
        {/* Location / GNSS */}
        <View style={styles.permissionCard}>
          <View style={styles.iconBox}>
            <MapPin size={24} color={Colors.primaryBrand} />
          </View>
          <View style={styles.textBox}>
            <View style={styles.nameRow}>
              <Text style={[Typography.titleLg, styles.permName]}>Precise Location (GNSS)</Text>
              {permissions.location && <CheckCircle2 size={16} color="#4caf50" />}
            </View>
            <Text style={[Typography.bodySm, styles.permDesc]}>
              Provides raw satellite ephemeris, constellation data, and baseline coordinates.
            </Text>
          </View>
          <Switch
            value={permissions.location}
            onValueChange={() => togglePermission('location')}
            trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primaryContainer }}
            thumbColor="#ffffff"
          />
        </View>

        {/* IMU Motion Sensors */}
        <View style={styles.permissionCard}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 152, 0, 0.15)' }]}>
            <Activity size={24} color={Colors.secondaryContainer} />
          </View>
          <View style={styles.textBox}>
            <View style={styles.nameRow}>
              <Text style={[Typography.titleLg, styles.permName]}>Motion & IMU Sensors</Text>
              {permissions.motion && <CheckCircle2 size={16} color="#4caf50" />}
            </View>
            <Text style={[Typography.bodySm, styles.permDesc]}>
              High-rate 100Hz accelerometer and gyroscope streams for dead reckoning.
            </Text>
          </View>
          <Switch
            value={permissions.motion}
            onValueChange={() => togglePermission('motion')}
            trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primaryContainer }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Notifications */}
        <View style={styles.permissionCard}>
          <View style={styles.iconBox}>
            <Bell size={24} color={Colors.onSurfaceVariant} />
          </View>
          <View style={styles.textBox}>
            <View style={styles.nameRow}>
              <Text style={[Typography.titleLg, styles.permName]}>Critical Outage Alerts</Text>
              {permissions.notifications && <CheckCircle2 size={16} color="#4caf50" />}
            </View>
            <Text style={[Typography.bodySm, styles.permDesc]}>
              Audible voice cues and heads-up notifications upon GNSS loss.
            </Text>
          </View>
          <Switch
            value={permissions.notifications}
            onValueChange={() => togglePermission('notifications')}
            trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primaryContainer }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Continue Action */}
      <TouchableOpacity style={styles.submitButton} onPress={onComplete} activeOpacity={0.85}>
        <Text style={[Typography.labelLg, styles.submitText]}>Save & Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingBottom: 40,
  },
  header: {
    marginTop: Spacing.stackMd,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    color: Colors.onSurface,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.onSurfaceVariant,
    marginTop: 8,
    lineHeight: 22,
  },
  list: {
    gap: 16,
    marginBottom: 32,
  },
  permissionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  permName: {
    flexShrink: 1,
    color: Colors.onSurface,
    fontSize: 16,
    fontWeight: '600',
  },
  permDesc: {
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 18,
  },
  submitButton: {
    minHeight: 56,
    paddingVertical: 12,
    borderRadius: 28,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    color: Colors.onPrimary,
    fontWeight: '700',
  },
});
