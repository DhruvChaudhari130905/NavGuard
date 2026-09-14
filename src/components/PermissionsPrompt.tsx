import React, { useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Activity, Bell, CheckCircle2, MapPin } from 'lucide-react-native';
import { Colors, Typography } from '../theme';

interface PermissionsPromptProps {
  visible: boolean;
  onAccept: () => Promise<void> | void;
}

export const PermissionsPrompt: React.FC<PermissionsPromptProps> = ({ visible, onAccept }) => {
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const simulatedPermissions = useMemo(() => [
    {
      icon: MapPin,
      name: 'Location',
      label: 'GPS location and GNSS',
      prompt: 'NavGuard would like to access your precise location while navigating.',
    },
    {
      icon: Activity,
      name: 'Motion Sensors',
      label: 'Motion and IMU sensors',
      prompt: 'NavGuard would like to read simulated motion sensor data for dead reckoning.',
    },
    {
      icon: Bell,
      name: 'Notifications',
      label: 'Critical outage notifications',
      prompt: 'NavGuard would like to send simulated critical outage alerts.',
    },
  ], []);

  const startSimulation = () => setStepIndex(0);

  const advanceSimulation = async () => {
    if (stepIndex === null) return;

    if (stepIndex < simulatedPermissions.length - 1) {
      setStepIndex(stepIndex + 1);
      return;
    }

    setStepIndex(null);
    await onAccept();
  };

  const activePermission = stepIndex === null ? null : simulatedPermissions[stepIndex];
  const ActiveIcon = activePermission?.icon;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {activePermission && ActiveIcon ? (
            <>
              <View style={styles.systemIcon}>
                <ActiveIcon size={28} color={Colors.primaryBrand} />
              </View>
              <Text style={[Typography.titleLg, styles.systemTitle]}>{activePermission.name} Permission</Text>
              <Text style={[Typography.bodySm, styles.systemMessage]}>{activePermission.prompt}</Text>
              <Text style={styles.simulationBadge}>Simulation only - no device permission is requested</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.choiceButton, styles.secondaryButton]} onPress={() => { void advanceSimulation(); }} activeOpacity={0.85}>
                  <Text style={styles.secondaryButtonText}>Not now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.choiceButton} onPress={() => { void advanceSimulation(); }} activeOpacity={0.85}>
                  <Text style={styles.buttonText}>Allow</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={[Typography.titleLg, styles.title]}>Simulate NavGuard permissions</Text>
              <Text style={[Typography.bodySm, styles.subtitle]}>
                NavGuard will show mock permission prompts for the demo. Your phone will not receive real system permission requests.
              </Text>
              <View style={styles.list}>
                {simulatedPermissions.map(({ icon: Icon, label }) => (
                  <View style={styles.row} key={label}>
                    <Icon size={18} color={Colors.primaryBrand} />
                    <Text style={styles.rowText}>{label}</Text>
                    <CheckCircle2 size={16} color="#4caf50" />
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.button} onPress={startSimulation} activeOpacity={0.85}>
                <Text style={styles.buttonText}>Start simulated permissions</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: Colors.surface, borderRadius: 22, padding: 22, borderWidth: 1, borderColor: Colors.surfaceContainerHighest },
  title: { color: Colors.onSurface, fontWeight: '800' },
  subtitle: { color: Colors.onSurfaceVariant, marginTop: 8, lineHeight: 20 },
  list: { marginTop: 18, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText: { color: Colors.onSurface, flex: 1, fontSize: 14 },
  button: { height: 50, marginTop: 22, borderRadius: 13, backgroundColor: Colors.primaryBrand, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: Colors.onPrimary, fontWeight: '700' },
  systemIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 14 },
  systemTitle: { color: Colors.onSurface, fontWeight: '800', textAlign: 'center' },
  systemMessage: { color: Colors.onSurfaceVariant, marginTop: 10, lineHeight: 20, textAlign: 'center' },
  simulationBadge: { color: Colors.primaryBrand, marginTop: 14, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  choiceButton: { flex: 1, height: 48, borderRadius: 13, backgroundColor: Colors.primaryBrand, alignItems: 'center', justifyContent: 'center' },
  secondaryButton: { backgroundColor: Colors.surfaceContainerLow, borderWidth: 1, borderColor: Colors.surfaceContainerHighest },
  secondaryButtonText: { color: Colors.onSurface, fontWeight: '700' },
});
