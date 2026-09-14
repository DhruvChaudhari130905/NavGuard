import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
} from 'react-native';
import {
  Navigation,
  History,
  CloudDownload,
  Sliders,
  CheckCircle,
  Satellite,
  X,
  Cpu,
  Car,
  Truck,
  RefreshCw,
  User,
  Settings,
  Zap,
} from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../theme';
import { Header } from '../components/common/Header';
import { useNavigation } from '../context/NavigationContext';

interface HomeScreenProps {
  onStartNav: () => void;
  onOpenDemo: () => void;
  onOpenTrips: () => void;
  onOpenSettings: () => void;
  onOpenProfile?: () => void;
  profile?: { name: string; email: string; plan: string };
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartNav,
  onOpenDemo,
  onOpenTrips,
  onOpenSettings,
  onOpenProfile,
  profile = { name: 'Atharva Teli', email: '', plan: 'NavGuard Pro' },
}) => {
  const {
    satellitesVisible,
    navigationMode,
    isGnssSignalOn,
  } = useNavigation();

  // ── Sidebar State ──
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [vehicleProfile, setVehicleProfile] = useState<'car' | 'fleet' | 'uav'>('car');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(true);
  const [isHighContrastHUD, setIsHighContrastHUD] = useState(false);
  const [isEmergencyDRMode, setIsEmergencyDRMode] = useState(false);

  // ── Toast Notification ──
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleStartNav = () => {
    onStartNav();
  };

  const handleCalibrateIMU = () => {
    if (isCalibrating) return;
    setIsCalibrating(true);
    showToast('Calibrating 6-DOF IMU zero-point bias...');
    setTimeout(() => {
      setIsCalibrating(false);
      setIsCalibrated(true);
      showToast('✓ IMU Sensors Calibrated successfully');
    }, 1800);
  };

  const isHealthy = isGnssSignalOn && navigationMode === 'GNSS_HEALTHY';
  const profileName = profile.name.trim() || 'NavGuard User';
  const profileInitials = profileName.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={styles.container}>
      <Header
        title="NavGuard"
        onMenuPress={() => setIsSidebarOpen(true)}
        onProfilePress={onOpenProfile}
      />

      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={[Typography.headlineLg, styles.heroTitle]}>
            Where shall we guide you today?
          </Text>
          <Text style={[Typography.titleLg, styles.heroSubtitle]}>
            Ready for your next resilient journey?
          </Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeaderRow}>
            <View style={styles.statusTitleRow}>
              <View style={[styles.pulseIndicator, !isHealthy && styles.pulseIndicatorOutage]} />
              <Text style={styles.statusTitle} numberOfLines={1}>
                {isHealthy ? 'GNSS Healthy' : 'AI + INS Dead Reckoning'}
              </Text>
            </View>

            <TouchableOpacity style={styles.simBadge} onPress={onOpenDemo} activeOpacity={0.8}>
              <Satellite size={14} color={Colors.secondaryContainer} />
              <Text style={[Typography.labelSm, styles.simBadgeText]}>SIM CONSOLE</Text>
            </TouchableOpacity>
          </View>

          <Text style={[Typography.bodyMd, styles.statusSubtitle]}>
            {isHealthy
              ? `Lock acquired • ${satellitesVisible} Satellites visible`
              : 'GNSS Signal Lost • Inertial Model Tracking Active'}
          </Text>

          <View style={styles.signalMeterRow}>
            <View style={[styles.signalBar, isHealthy ? styles.signalBarActive : styles.signalBarOutage]} />
            <View style={[styles.signalBar, isHealthy ? styles.signalBarActive : styles.signalBarOutage]} />
            <View style={[styles.signalBar, isHealthy ? styles.signalBarActive : styles.signalBarOutage]} />
            <View style={[styles.signalBar, isHealthy ? styles.signalBarActive : styles.signalBarInactive]} />
            <View style={[styles.signalBar, styles.signalBarInactive]} />
            <Text style={[Typography.labelSm, styles.signalLabel]}>
              {isHealthy ? 'Excellent' : 'Degraded (DR Active)'}
            </Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStartNav} activeOpacity={0.85}>
            <Navigation size={22} color={Colors.onPrimary} />
            <Text style={[Typography.labelLg, styles.startButtonText]}>Start Navigation</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bentoGrid}>
          <TouchableOpacity style={styles.bentoCard} onPress={onOpenTrips} activeOpacity={0.8}>
            <View style={styles.iconCircle}>
              <History size={22} color={Colors.primaryBrand} />
            </View>
            <View>
              <Text style={[Typography.labelLg, styles.bentoTitle]}>Recent Trips</Text>
              <Text style={[Typography.labelSm, styles.bentoSubtitle]}>Home, Office, SFO</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.bentoCard, styles.bentoCardRelative]} onPress={onOpenSettings} activeOpacity={0.8}>
            <View style={styles.insightChip}>
              <Text style={styles.insightChipText}>UPDATED</Text>
            </View>
            <View style={styles.iconCircle}>
              <CloudDownload size={22} color={Colors.primaryBrand} />
            </View>
            <View>
              <Text style={[Typography.labelLg, styles.bentoTitle]}>Offline Maps</Text>
              <Text style={[Typography.labelSm, styles.bentoSubtitle]}>Pune City DL'd</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bentoCard} onPress={onOpenSettings} activeOpacity={0.8}>
            <View style={styles.iconCircle}>
              <Sliders size={22} color={Colors.primaryBrand} />
            </View>
            <View>
              <Text style={[Typography.labelLg, styles.bentoTitle]}>Route Settings</Text>
              <Text style={[Typography.labelSm, styles.bentoSubtitle]}>AI Failover Prefs</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.healthCard}>
          <Text style={[Typography.titleLg, styles.healthTitle]}>System Health</Text>

          <View style={styles.healthList}>
            <View style={styles.healthItem}>
              <View style={styles.healthItemLeft}>
                <CheckCircle size={20} color="#32963b" />
                <Text style={[Typography.bodyMd, styles.healthItemText]}>GNSS Multi-Band Sensor</Text>
              </View>
              <Text style={[Typography.labelSm, styles.healthStatusActive]}>ONLINE</Text>
            </View>

            <View style={styles.healthItem}>
              <View style={styles.healthItemLeft}>
                <CheckCircle size={20} color="#32963b" />
                <Text style={[Typography.bodyMd, styles.healthItemText]}>IMU 6-DOF Calibration</Text>
              </View>
              <Text style={[Typography.labelSm, styles.healthStatusActive]}>
                {isCalibrated ? 'CALIBRATED' : 'UNCALIBRATED'}
              </Text>
            </View>

            <View style={styles.healthItem}>
              <View style={styles.healthItemLeft}>
                <CheckCircle size={20} color="#32963b" />
                <Text style={[Typography.bodyMd, styles.healthItemText]}>AI Dead Reckoning Core</Text>
              </View>
              <Text style={[Typography.labelSm, styles.healthStatusActive]}>READY</Text>
            </View>

            <View style={styles.healthItem}>
              <View style={styles.healthItemLeft}>
                <CheckCircle size={20} color="#32963b" />
                <Text style={[Typography.bodyMd, styles.healthItemText]}>Offline Spatial Tiles</Text>
              </View>
              <Text style={[Typography.labelSm, styles.healthStatusActive]}>VALID</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isSidebarOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSidebarOpen(false)}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity style={styles.drawerBackdrop} activeOpacity={1} onPress={() => setIsSidebarOpen(false)} />
          <View style={styles.drawerPanel}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerUserRow}>
                <View style={styles.drawerAvatar}>
                  <Text style={styles.drawerAvatarText}>{profileInitials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.drawerUserName}>{profileName}</Text>
                  <View style={styles.drawerBadgeRow}>
                    <View style={styles.proPill}>
                      <Text style={styles.proPillText}>{profile.plan || 'NavGuard Pro'}</Text>
                    </View>
                    <Text style={styles.fleetStatus}>Connected</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.drawerCloseBtn} onPress={() => setIsSidebarOpen(false)}>
                  <X size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.drawerStatusRibbon}>
                <View style={styles.statusDotLive} />
                <Text style={styles.drawerStatusText}>Sensor Fusion: 100Hz IMU • 18 Constellation Sats</Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.drawerScroll}>
              <View style={styles.drawerSection}>
                <Text style={styles.drawerSectionTitle}>Vehicle Dynamics Mode</Text>
                <View style={styles.vehicleModeGrid}>
                  <TouchableOpacity style={[styles.vehicleCard, vehicleProfile === 'car' && styles.vehicleCardActive]} onPress={() => { setVehicleProfile('car'); showToast('Switched to Passenger Car'); }}>
                    <Car size={20} color={vehicleProfile === 'car' ? Colors.secondaryContainer : Colors.onSurfaceVariant} />
                    <Text style={[styles.vehicleCardText, vehicleProfile === 'car' && styles.vehicleCardTextActive]}>Passenger</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.vehicleCard, vehicleProfile === 'fleet' && styles.vehicleCardActive]} onPress={() => { setVehicleProfile('fleet'); showToast('Switched to Fleet'); }}>
                    <Truck size={20} color={vehicleProfile === 'fleet' ? Colors.secondaryContainer : Colors.onSurfaceVariant} />
                    <Text style={[styles.vehicleCardText, vehicleProfile === 'fleet' && styles.vehicleCardTextActive]}>Fleet</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.vehicleCard, vehicleProfile === 'uav' && styles.vehicleCardActive]} onPress={() => { setVehicleProfile('uav'); showToast('Switched to UAV'); }}>
                    <Zap size={20} color={vehicleProfile === 'uav' ? Colors.secondaryContainer : Colors.onSurfaceVariant} />
                    <Text style={[styles.vehicleCardText, vehicleProfile === 'uav' && styles.vehicleCardTextActive]}>UAV</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.drawerSection}>
                <Text style={styles.drawerSectionTitle}>Sensor Fusion Tools</Text>
                <TouchableOpacity style={styles.toolRow} onPress={handleCalibrateIMU} activeOpacity={0.8}>
                  <View style={styles.toolIconBox}><RefreshCw size={18} color={isCalibrating ? Colors.secondaryContainer : Colors.primaryBrand} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toolTitle}>6-DOF IMU Calibration</Text>
                    <Text style={styles.toolSub}>{isCalibrating ? 'Calibrating Gyro & Accel...' : 'Zero-drift bias calibrated'}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolRow} onPress={() => { setIsSidebarOpen(false); onOpenDemo(); }} activeOpacity={0.8}>
                  <View style={[styles.toolIconBox, { backgroundColor: 'rgba(255, 152, 0, 0.15)' }]}><Cpu size={18} color={Colors.secondaryContainer} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toolTitle}>GNSS Simulation Suite</Text>
                    <Text style={styles.toolSub}>Simulate tunnel blackout & DR waveforms</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolRow} onPress={() => { setIsSidebarOpen(false); onOpenSettings(); }} activeOpacity={0.8}>
                  <View style={styles.toolIconBox}><CloudDownload size={18} color={Colors.primaryBrand} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toolTitle}>Offline Map Cache</Text>
                    <Text style={styles.toolSub}>Pune City & PCMC (1.4 GB Active)</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.drawerSection}>
                <Text style={styles.drawerSectionTitle}>Display & HUD</Text>
                <View style={styles.drawerToggleCard}>
                  <View style={styles.drawerToggleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.drawerToggleTitle}>High-Contrast Night HUD</Text>
                      <Text style={styles.toolSub}>Anti-glare vector road contrast</Text>
                    </View>
                    <Switch
                      value={isHighContrastHUD}
                      onValueChange={(v) => {
                        setIsHighContrastHUD(v);
                        showToast(v ? '✓ High-Contrast HUD Enabled' : 'Standard View Enabled');
                      }}
                      trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.secondaryContainer }}
                      thumbColor={isHighContrastHUD ? Colors.onSecondaryContainer : Colors.outline}
                    />
                  </View>
                  <View style={[styles.drawerToggleRow, { borderTopWidth: 1, borderTopColor: Colors.surfaceContainerLow, marginTop: 8, paddingTop: 8 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.drawerToggleTitle}>200Hz Fast Sensor Polling</Text>
                      <Text style={styles.toolSub}>High-rate IMU dead reckoning</Text>
                    </View>
                    <Switch
                      value={isEmergencyDRMode}
                      onValueChange={(v) => {
                        setIsEmergencyDRMode(v);
                        showToast(v ? '✓ 200Hz Ultra-Fast Polling ON' : 'Standard 100Hz Polling');
                      }}
                      trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.secondaryContainer }}
                      thumbColor={isEmergencyDRMode ? Colors.onSecondaryContainer : Colors.outline}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.drawerSection}>
                <Text style={styles.drawerSectionTitle}>Shortcuts</Text>
                <TouchableOpacity style={styles.shortcutRow} onPress={() => { setIsSidebarOpen(false); onOpenTrips(); }} activeOpacity={0.7}>
                  <History size={18} color={Colors.primaryBrand} />
                  <Text style={styles.shortcutText}>Past Blackout & Drift Logs</Text>
                </TouchableOpacity>
                {onOpenProfile && (
                  <TouchableOpacity style={styles.shortcutRow} onPress={() => { setIsSidebarOpen(false); onOpenProfile(); }} activeOpacity={0.7}>
                    <User size={18} color={Colors.primaryBrand} />
                    <Text style={styles.shortcutText}>My Profile & Saved Locations</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.shortcutRow} onPress={() => { setIsSidebarOpen(false); onOpenSettings(); }} activeOpacity={0.7}>
                  <Settings size={18} color={Colors.primaryBrand} />
                  <Text style={styles.shortcutText}>System Config & Failover Prefs</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: Colors.surfaceContainerHighest, backgroundColor: Colors.surfaceContainerLowest, alignItems: 'center' }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.onSurfaceVariant }}>NavGuard Resilient Navigation • v2.4.1</Text>
              <Text style={{ fontSize: 10, color: Colors.outline, marginTop: 2 }}>Material 3 • AI Dead Reckoning 1.9.0</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  toastContainer: { position: 'absolute', top: 60, alignSelf: 'center', backgroundColor: '#333', padding: 12, borderRadius: 20, zIndex: 999 },
  toastText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  scrollContent: { padding: 16, paddingBottom: 110, width: '100%', maxWidth: 720, alignSelf: 'center' },
  heroSection: { marginBottom: 20 },
  heroTitle: { color: Colors.onBackground, fontWeight: '700', letterSpacing: -0.5, fontSize: 28, lineHeight: 34 },
  heroSubtitle: { color: Colors.onSurfaceVariant, marginTop: 8, fontSize: 18, lineHeight: 26 },
  statusCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: Colors.surfaceContainerHighest, marginBottom: 20 },
  statusHeaderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  statusTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  pulseIndicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4caf50' },
  pulseIndicatorOutage: { backgroundColor: Colors.secondaryContainer },
  statusTitle: { color: Colors.onSurface, fontWeight: '700', fontSize: 16, flexShrink: 1 },
  simBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 152, 0, 0.15)', padding: 6, borderRadius: 8, gap: 4 },
  simBadgeText: { color: Colors.secondary, fontWeight: '700', fontSize: 10 },
  statusSubtitle: { color: Colors.onSurfaceVariant, fontSize: 13, marginTop: 4 },
  signalMeterRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginVertical: 16 },
  signalBar: { flex: 1, height: 6, borderRadius: 3 },
  signalBarActive: { backgroundColor: '#4caf50' },
  signalBarOutage: { backgroundColor: Colors.secondaryContainer },
  signalBarInactive: { backgroundColor: Colors.surfaceContainerHigh },
  signalLabel: { color: Colors.onSurfaceVariant, marginLeft: 8, fontWeight: '600', fontSize: 11 },
  startButton: { minHeight: 52, backgroundColor: Colors.primaryContainer, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  startButtonText: { color: Colors.onPrimary, fontWeight: '700', fontSize: 16 },
  bentoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  bentoCard: { flexGrow: 1, flexBasis: 150, backgroundColor: Colors.surface, borderRadius: 18, padding: 14, minHeight: 120, borderWidth: 1, borderColor: Colors.surfaceContainerHighest },
  bentoCardRelative: { position: 'relative' },
  insightChip: { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.secondaryFixed, paddingHorizontal: 6, borderRadius: 99 },
  insightChipText: { color: Colors.onSecondaryFixed, fontSize: 9, fontWeight: '800' },
  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  bentoTitle: { color: Colors.onSurface, fontWeight: '600', fontSize: 13 },
  bentoSubtitle: { color: Colors.onSurfaceVariant, fontSize: 11, marginTop: 2 },
  healthCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: Colors.surfaceContainerHighest },
  healthTitle: { color: Colors.onSurface, fontWeight: '700', marginBottom: 16 },
  healthList: { gap: 14 },
  healthItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  healthItemLeft: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },
  healthItemText: { color: Colors.onSurface, flexShrink: 1 },
  healthStatusActive: { color: '#32963b', fontWeight: '700', fontSize: 11 },
  drawerOverlay: { flex: 1, flexDirection: 'row' },
  drawerBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawerPanel: { width: '85%', maxWidth: 350, height: '100%', backgroundColor: Colors.surface },
  drawerHeader: { backgroundColor: Colors.primaryContainer, padding: 20, paddingTop: 50 },
  drawerUserRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  drawerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.secondaryContainer, justifyContent: 'center', alignItems: 'center' },
  drawerAvatarText: { color: Colors.onSecondaryContainer, fontWeight: '800' },
  drawerUserName: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  drawerBadgeRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  proPill: { backgroundColor: Colors.secondaryContainer, paddingHorizontal: 6, borderRadius: 6 },
  proPillText: { fontSize: 9, fontWeight: '700', color: Colors.onSecondaryContainer },
  fleetStatus: { fontSize: 11, color: '#FFF' },
  drawerCloseBtn: { padding: 4 },
  drawerStatusRibbon: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 15, backgroundColor: 'rgba(0,0,0,0.1)', padding: 8, borderRadius: 8 },
  statusDotLive: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4caf50' },
  drawerStatusText: { color: '#FFF', fontSize: 10 },
  drawerScroll: { padding: 16 },
  drawerSection: { marginBottom: 24 },
  drawerSectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.onSurfaceVariant, textTransform: 'uppercase', marginBottom: 10 },
  vehicleModeGrid: { flexDirection: 'row', gap: 8 },
  vehicleCard: { flex: 1, backgroundColor: Colors.surfaceContainerLow, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  vehicleCardActive: { borderColor: Colors.secondaryContainer, backgroundColor: 'rgba(255, 152, 0, 0.1)' },
  vehicleCardText: { fontSize: 10, marginTop: 6, color: Colors.onSurfaceVariant },
  vehicleCardTextActive: { color: Colors.secondary, fontWeight: '700' },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: Colors.surfaceContainerLow, borderRadius: 12, marginBottom: 8 },
  toolIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceContainerHigh, justifyContent: 'center', alignItems: 'center' },
  toolTitle: { fontSize: 13, fontWeight: '600' },
  toolSub: { fontSize: 11, color: Colors.onSurfaceVariant },
  drawerToggleCard: { backgroundColor: Colors.surfaceContainerLow, padding: 12, borderRadius: 12 },
  drawerToggleRow: { flexDirection: 'row', alignItems: 'center' },
  drawerToggleTitle: { fontSize: 13, fontWeight: '600' },
  shortcutRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: Colors.surfaceContainerLow, borderRadius: 12, marginBottom: 8 },
  shortcutText: { fontSize: 13, fontWeight: '600' },
});
