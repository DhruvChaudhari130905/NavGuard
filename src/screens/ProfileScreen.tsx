import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {
  MapPin,
  Home,
  Briefcase,
  GraduationCap,
  ChevronRight,
  LogOut,
  Bell,
  Cloud,
  Shield,
  UserCircle,
  Pencil,
  Star,
  Route,
  Wifi,
  Plus,
  Trash2,
  Check,
  X,
  Building2,
  Key,
  RefreshCw,
  Download,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../theme';
import { Header } from '../components/common/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedLocation {
  id: string;
  iconType: 'home' | 'office' | 'education' | 'pin' | 'star' | 'building';
  label: string;
  sub: string;
}

interface ProfileScreenProps {
  onProfileUpdated?: (profile: { name: string; email: string; plan: string }) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onProfileUpdated }) => {
  // ── Profile State ──
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('');
  const [memberSince] = useState('Sep 2024');

  // Load profile data from AsyncStorage on mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const nameValue = await AsyncStorage.getItem('profileName');
        const emailValue = await AsyncStorage.getItem('profileEmail');
        const planValue = await AsyncStorage.getItem('profilePlan');

        if (nameValue !== null) {
          setName(nameValue);
        }
        if (emailValue !== null) {
          setEmail(emailValue);
        }
        if (planValue !== null) {
          setPlan(planValue);
        }
        // memberSince is static, no need to load
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };

    loadProfileData();
  }, []);

  // ── Toggles ──
  const [cloudSync, setCloudSync] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [biometrics, setBiometrics] = useState(true);

  // ── Stats ──
  const [tripsCount, setTripsCount] = useState(47);
  const [kmDriven, setKmDriven] = useState(284);
  const [outagesSurvived, setOutagesSurvived] = useState(12);

  // ── Saved Locations ──
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([
    { id: '1', iconType: 'home', label: 'Home', sub: 'Kothrud, Pune' },
    { id: '2', iconType: 'office', label: 'Office', sub: 'Baner, Pune' },
    { id: '3', iconType: 'education', label: 'MIT WPU Campus', sub: 'Kothrud, Pune' },
  ]);

  useEffect(() => {
    const loadSavedLocations = async () => {
      try {
        const stored = await AsyncStorage.getItem('savedLocations');
        if (stored) setSavedLocations(JSON.parse(stored) as SavedLocation[]);
      } catch (error) {
        console.error('Failed to load saved locations:', error);
      }
    };
    void loadSavedLocations();
  }, []);

  // ── Modals State ──
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempPlan, setTempPlan] = useState(plan);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [locationSub, setLocationSub] = useState('');
  const [locationIconType, setLocationIconType] = useState<SavedLocation['iconType']>('home');

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  // ── Toast Notification ──
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Compute initials
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'NG';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // ── Handlers: Profile Edit ──
  const handleOpenEditProfile = () => {
    setTempName(name);
    setTempEmail(email);
    setTempPlan(plan);
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!tempName.trim()) {
      showToast('Name cannot be empty');
      return;
    }
    setName(tempName.trim());
    setEmail(tempEmail.trim());
    setPlan(tempPlan);
    onProfileUpdated?.({
      name: tempName.trim(),
      email: tempEmail.trim(),
      plan: tempPlan.trim(),
    });

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('profileName', tempName.trim());
      await AsyncStorage.setItem('profileEmail', tempEmail.trim());
      await AsyncStorage.setItem('profilePlan', tempPlan);
      showToast('✓ Profile updated successfully');
    } catch (error) {
      console.error('Failed to save profile data:', error);
      showToast('✗ Failed to save profile');
    }

    setIsEditProfileOpen(false);
  };

  // ── Handlers: Locations ──
  const handleOpenAddLocation = () => {
    setEditingLocationId(null);
    setLocationLabel('');
    setLocationSub('');
    setLocationIconType('pin');
    setIsLocationModalOpen(true);
  };

  const handleOpenEditLocation = (loc: SavedLocation) => {
    setEditingLocationId(loc.id);
    setLocationLabel(loc.label);
    setLocationSub(loc.sub);
    setLocationIconType(loc.iconType);
    setIsLocationModalOpen(true);
  };

  const handleSaveLocation = async () => {
    if (!locationLabel.trim() || !locationSub.trim()) {
      showToast('Please fill in both label and address');
      return;
    }

    if (editingLocationId) {
      const nextLocations = savedLocations.map((loc) =>
          loc.id === editingLocationId
            ? { ...loc, label: locationLabel.trim(), sub: locationSub.trim(), iconType: locationIconType }
            : loc
        );
      setSavedLocations(nextLocations);
      await AsyncStorage.setItem('savedLocations', JSON.stringify(nextLocations));
      showToast('✓ Location updated');
    } else {
      const newLoc: SavedLocation = {
        id: Date.now().toString(),
        label: locationLabel.trim(),
        sub: locationSub.trim(),
        iconType: locationIconType,
      };
      const nextLocations = [...savedLocations, newLoc];
      setSavedLocations(nextLocations);
      await AsyncStorage.setItem('savedLocations', JSON.stringify(nextLocations));
      showToast('✓ New location added');
    }
    setIsLocationModalOpen(false);
  };

  const handleDeleteLocation = async () => {
    if (!editingLocationId) return;
    const nextLocations = savedLocations.filter((loc) => loc.id !== editingLocationId);
    setSavedLocations(nextLocations);
    await AsyncStorage.setItem('savedLocations', JSON.stringify(nextLocations));
    setIsLocationModalOpen(false);
    showToast('✓ Location deleted');
  };

  // ── Handlers: Reset / Export ──
  const handleResetTelemetry = () => {
    Alert.alert(
      'Reset Telemetry Stats',
      'Are you sure you want to reset your local trip logs and drift telemetry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setTripsCount(0);
            setKmDriven(0);
            setOutagesSurvived(0);
            showToast('✓ Telemetry stats reset to zero');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    showToast(`✓ Exported ${tripsCount} trips & sensor telemetry to CSV`);
  };

  const handleConfirmSignOut = () => {
    setIsSignOutModalOpen(false);
    showToast('✓ Successfully signed out');
  };

  const renderLocationIcon = (type: SavedLocation['iconType']) => {
    switch (type) {
      case 'home':
        return <Home size={18} color={Colors.primaryBrand} />;
      case 'office':
        return <Briefcase size={18} color={Colors.primaryBrand} />;
      case 'education':
        return <GraduationCap size={18} color={Colors.primaryBrand} />;
      case 'star':
        return <Star size={18} color={Colors.secondaryContainer} />;
      case 'building':
        return <Building2 size={18} color={Colors.primaryBrand} />;
      case 'pin':
      default:
        return <MapPin size={18} color={Colors.primaryBrand} />;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Profile" showProfile={false} />

      {/* Floating Toast Message */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar & Identity Card ── */}
        <View style={styles.heroCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
            </View>
            <View style={styles.proBadgeDot}>
              <Star size={9} color="#fff" fill="#fff" />
            </View>
          </View>

          <View style={styles.heroInfo}>
            <Text style={[Typography.headlineLg, styles.heroName]}>{name}</Text>
            <View style={styles.proBadgeRow}>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>{plan}</Text>
              </View>
              <Text style={[Typography.bodySm, styles.memberSince]}>Member since {memberSince}</Text>
            </View>
            <Text style={[Typography.bodySm, styles.heroEmail]}>{email}</Text>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.8}
            onPress={handleOpenEditProfile}
          >
            <Pencil size={16} color={Colors.onPrimary} />
            <Text style={[Typography.labelSm, styles.editBtnText]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ── Trip Stats Row ── */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.7}
            onPress={() => showToast(`Total Completed Trips: ${tripsCount}`)}
          >
            <Route size={20} color={Colors.secondaryContainer} />
            <Text style={styles.statValue}>{tripsCount}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.7}
            onPress={() => showToast(`Total Distance Driven: ${kmDriven} km`)}
          >
            <MapPin size={20} color={Colors.secondaryContainer} />
            <Text style={styles.statValue}>{kmDriven}</Text>
            <Text style={styles.statLabel}>Km driven</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.7}
            onPress={() => showToast(`AI Failover Blackouts Handled: ${outagesSurvived}`)}
          >
            <Wifi size={20} color={Colors.secondaryContainer} />
            <Text style={styles.statValue}>{outagesSurvived}</Text>
            <Text style={styles.statLabel}>Outages survived</Text>
          </TouchableOpacity>
        </View>

        {/* ── AI Accuracy Section ── */}
        <View style={styles.section}>
          <Text style={[Typography.titleLg, styles.sectionTitle]}>AI Navigation Accuracy</Text>
          <View style={styles.card}>
            <AccuracyBar label="Dead Reckoning Accuracy" value={99.2} color="#32963b" displayText="99.2%" />
            <AccuracyBar label="Avg Drift per Km" value={4} color={Colors.secondaryContainer} displayText="0.4 m/km" />
            <AccuracyBar label="Outage Recovery Time" value={80} color="#4fc3f7" displayText="0.8 s avg" />
          </View>
        </View>

        {/* ── Saved Locations ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[Typography.titleLg, styles.sectionTitle]}>Saved Locations</Text>
            <TouchableOpacity
              style={styles.addLocationBtn}
              onPress={handleOpenAddLocation}
              activeOpacity={0.7}
            >
              <Plus size={14} color={Colors.primaryBrand} />
              <Text style={styles.addLocationText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {savedLocations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No saved locations yet.</Text>
              </View>
            ) : (
              savedLocations.map((loc, index) => (
                <React.Fragment key={loc.id}>
                  <TouchableOpacity
                    style={styles.chevronRow}
                    activeOpacity={0.7}
                    onPress={() => handleOpenEditLocation(loc)}
                  >
                    <View style={styles.chevronRowLeft}>
                      <View style={styles.iconCircle}>{renderLocationIcon(loc.iconType)}</View>
                      <View style={{ flex: 1 }}>
                        <Text style={[Typography.bodyMd, styles.rowTitle]}>{loc.label}</Text>
                        <Text style={[Typography.bodySm, styles.rowSub]}>{loc.sub}</Text>
                      </View>
                    </View>
                    <Pencil size={15} color={Colors.onSurfaceVariant} />
                  </TouchableOpacity>
                  {index < savedLocations.length - 1 && <View style={styles.rowDivider} />}
                </React.Fragment>
              ))
            )}
          </View>
        </View>

        {/* ── Account & Security ── */}
        <View style={styles.section}>
          <Text style={[Typography.titleLg, styles.sectionTitle]}>Account & Security</Text>
          <View style={styles.card}>
            <ToggleRow
              icon={<Cloud size={18} color={Colors.primaryBrand} />}
              label="Cloud Sync"
              sub="Trips & settings backed up"
              value={cloudSync}
              onChange={(val) => {
                setCloudSync(val);
                showToast(val ? '✓ Cloud sync enabled' : 'Cloud sync disabled');
              }}
            />
            <View style={styles.rowDivider} />
            <ToggleRow
              icon={<Bell size={18} color={Colors.primaryBrand} />}
              label="Route Notifications"
              sub="Alerts during GNSS outage"
              value={notifications}
              onChange={(val) => {
                setNotifications(val);
                showToast(val ? '✓ Route notifications active' : 'Route notifications muted');
              }}
            />
            <View style={styles.rowDivider} />
            <ToggleRow
              icon={<Shield size={18} color={Colors.primaryBrand} />}
              label="Privacy Mode"
              sub="No location telemetry stored"
              value={privacyMode}
              onChange={(val) => {
                setPrivacyMode(val);
                showToast(val ? '✓ Privacy mode turned ON' : 'Privacy mode turned OFF');
              }}
            />
            <View style={styles.rowDivider} />
            <TouchableOpacity
              style={styles.chevronRow}
              activeOpacity={0.7}
              onPress={() => setIsAccountModalOpen(true)}
            >
              <View style={styles.chevronRowLeft}>
                <View style={styles.iconCircle}>
                  <UserCircle size={18} color={Colors.primaryBrand} />
                </View>
                <View>
                  <Text style={[Typography.bodyMd, styles.rowTitle]}>Manage Account</Text>
                  <Text style={[Typography.bodySm, styles.rowSub]}>Security, 2FA, data export</Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── App Version ── */}
        <Text style={styles.versionText}>NavGuard v2.4.1 • AI Core 1.9.0</Text>

        {/* ── Sign Out ── */}
        <TouchableOpacity
          style={styles.signOutBtn}
          activeOpacity={0.85}
          onPress={() => setIsSignOutModalOpen(true)}
        >
          <LogOut size={18} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 1: EDIT PROFILE ────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={isEditProfileOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditProfileOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => setIsEditProfileOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={tempName}
                onChangeText={setTempName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.outline}
              />

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                value={tempEmail}
                onChangeText={setTempEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter email"
                placeholderTextColor={Colors.outline}
              />

              <Text style={styles.inputLabel}>Subscription Plan</Text>
              <View style={styles.planSelectorRow}>
                {['Standard', 'NavGuard Pro', 'Fleet Enterprise'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.planPill, tempPlan === p && styles.planPillActive]}
                    onPress={() => setTempPlan(p)}
                  >
                    <Text
                      style={[
                        styles.planPillText,
                        tempPlan === p && styles.planPillTextActive,
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsEditProfileOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Check size={18} color={Colors.onPrimary} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 2: ADD / EDIT LOCATION ─────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={isLocationModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLocationModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingLocationId ? 'Edit Location' : 'Add New Location'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsLocationModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Location Name</Text>
              <TextInput
                style={styles.textInput}
                value={locationLabel}
                onChangeText={setLocationLabel}
                placeholder="e.g. Home, Office, Gym, Campus"
                placeholderTextColor={Colors.outline}
              />

              <Text style={styles.inputLabel}>Address / Landmark</Text>
              <TextInput
                style={styles.textInput}
                value={locationSub}
                onChangeText={setLocationSub}
                placeholder="e.g. Kothrud, Pune or Hinjawadi, Pune"
                placeholderTextColor={Colors.outline}
              />

              <Text style={styles.inputLabel}>Choose Icon</Text>
              <View style={styles.iconPickerRow}>
                {(['home', 'office', 'education', 'pin', 'star', 'building'] as const).map(
                  (type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.iconPickerItem,
                        locationIconType === type && styles.iconPickerItemActive,
                      ]}
                      onPress={() => setLocationIconType(type)}
                    >
                      {renderLocationIcon(type)}
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            <View style={styles.modalFooter}>
              {editingLocationId ? (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteLocation}
                >
                  <Trash2 size={18} color={Colors.error} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsLocationModalOpen(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveLocation}
              >
                <Check size={18} color={Colors.onPrimary} />
                <Text style={styles.saveButtonText}>
                  {editingLocationId ? 'Save' : 'Add Location'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 3: MANAGE ACCOUNT ──────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={isAccountModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAccountModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Shield size={20} color={Colors.primaryBrand} />
                <Text style={styles.modalTitle}>Account & Security</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsAccountModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 20 }}>
              {/* Account summary pill */}
              <View style={styles.accountInfoCard}>
                <View style={styles.accountRow}>
                  <Text style={styles.accountLabel}>Account ID</Text>
                  <Text style={styles.accountValue}>NG-8942-PRO</Text>
                </View>
                <View style={styles.accountRow}>
                  <Text style={styles.accountLabel}>Encryption Status</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Lock size={12} color="#32963b" />
                    <Text style={[styles.accountValue, { color: '#32963b' }]}>AES-256 Active</Text>
                  </View>
                </View>
                <View style={styles.accountRow}>
                  <Text style={styles.accountLabel}>Offline Map Cache</Text>
                  <Text style={styles.accountValue}>1.4 GB / 5.0 GB</Text>
                </View>
              </View>

              {/* Security Toggles */}
              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Security Controls</Text>
              <View style={styles.accountToggleBox}>
                <View style={styles.accountToggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.accountToggleTitle}>Two-Factor Authentication</Text>
                    <Text style={styles.accountToggleSub}>Hardware key & SMS OTP for sync</Text>
                  </View>
                  <Switch
                    value={twoFactorAuth}
                    onValueChange={(v) => {
                      setTwoFactorAuth(v);
                      showToast(v ? '✓ 2FA Enabled' : '2FA Disabled');
                    }}
                    trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.secondaryContainer }}
                    thumbColor={twoFactorAuth ? Colors.onSecondaryContainer : Colors.outline}
                  />
                </View>

                <View style={[styles.accountToggleRow, { borderTopWidth: 1, borderTopColor: Colors.surfaceContainerLow }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.accountToggleTitle}>Biometric Unlock</Text>
                    <Text style={styles.accountToggleSub}>Require FaceID / Fingerprint on launch</Text>
                  </View>
                  <Switch
                    value={biometrics}
                    onValueChange={(v) => {
                      setBiometrics(v);
                      showToast(v ? '✓ Biometric unlock enabled' : 'Biometric unlock disabled');
                    }}
                    trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.secondaryContainer }}
                    thumbColor={biometrics ? Colors.onSecondaryContainer : Colors.outline}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Data & Telemetry</Text>
              <TouchableOpacity
                style={styles.accountActionBtn}
                activeOpacity={0.8}
                onPress={handleExportData}
              >
                <Download size={18} color={Colors.primaryBrand} />
                <Text style={styles.accountActionBtnText}>Export Trip Logs & Sensor Data (CSV)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.accountActionBtn, { borderColor: 'rgba(186, 26, 26, 0.3)', backgroundColor: 'rgba(186, 26, 26, 0.06)' }]}
                activeOpacity={0.8}
                onPress={handleResetTelemetry}
              >
                <RefreshCw size={18} color={Colors.error} />
                <Text style={[styles.accountActionBtnText, { color: Colors.error }]}>Reset Local Stats & Cache</Text>
              </TouchableOpacity>

              <View style={{ height: 24 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.saveButton, { flex: 1 }]}
                onPress={() => setIsAccountModalOpen(false)}
              >
                <Text style={styles.saveButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 4: SIGN OUT CONFIRMATION ───────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={isSignOutModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSignOutModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <View style={styles.warningCircle}>
                <AlertTriangle size={32} color={Colors.error} />
              </View>
              <Text style={[styles.modalTitle, { marginTop: 12, textAlign: 'center' }]}>
                Sign Out from NavGuard?
              </Text>
              <Text style={styles.warningSubtext}>
                You will need to sign in again to sync live dead reckoning logs and regional offline map tiles.
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsSignOutModalOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: Colors.error }]}
                onPress={handleConfirmSignOut}
              >
                <LogOut size={16} color="#fff" />
                <Text style={styles.saveButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── AccuracyBar ──────────────────────────────────────────────────────────────

interface AccuracyBarProps {
  label: string;
  value: number;
  color: string;
  displayText: string;
}

const AccuracyBar: React.FC<AccuracyBarProps> = ({ label, value, color, displayText }) => (
  <View style={ab.row}>
    <View style={ab.labelRow}>
      <Text style={[Typography.bodySm, ab.label]}>{label}</Text>
      <Text style={[Typography.labelSm, { color, fontWeight: '700' }]}>{displayText}</Text>
    </View>
    <View style={ab.track}>
      <View style={[ab.fill, { width: `${Math.min(100, value)}%` as any, backgroundColor: color }]} />
    </View>
  </View>
);

const ab = StyleSheet.create({
  row: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: Colors.onSurface, flex: 1 },
  track: {
    height: 6,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
});

// ─── ToggleRow ────────────────────────────────────────────────────────────────

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ icon, label, sub, value, onChange }) => (
  <View style={styles.chevronRow}>
    <View style={styles.chevronRowLeft}>
      <View style={styles.iconCircle}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[Typography.bodyMd, styles.rowTitle]}>{label}</Text>
        <Text style={[Typography.bodySm, styles.rowSub]}>{sub}</Text>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.secondaryContainer }}
      thumbColor={value ? Colors.onSecondaryContainer : Colors.outline}
    />
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.stackMd,
    paddingBottom: 110,
  },

  // Floating Toast
  toastContainer: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(13, 28, 50, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  toastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Hero Card
  heroCard: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarRing: {
    position: 'relative',
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onSecondaryContainer,
    letterSpacing: 1,
  },
  proBadgeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#f4b400',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primaryContainer,
  },
  heroInfo: {
    flex: 1,
    gap: 3,
  },
  heroName: {
    color: '#ffffff',
    fontSize: 18,
  },
  proBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  proBadge: {
    backgroundColor: Colors.secondaryContainer,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onSecondaryContainer,
    letterSpacing: 0.5,
  },
  memberSince: {
    color: Colors.onPrimaryContainer,
    fontSize: 11,
  },
  heroEmail: {
    color: Colors.onPrimaryContainer,
    fontSize: 12,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editBtnText: {
    color: Colors.onPrimary,
    fontSize: 12,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    marginBottom: 20,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.outlineVariant,
    marginVertical: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primaryBrand,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: 4,
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    color: Colors.onSurface,
    paddingHorizontal: 4,
    fontSize: 15,
  },
  addLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  addLocationText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryBrand,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.onSurfaceVariant,
    fontSize: 13,
  },

  // Rows
  chevronRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  chevronRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    color: Colors.onSurface,
    fontWeight: '500',
  },
  rowSub: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 1,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.surfaceContainerHighest,
    marginLeft: 48,
  },

  // Footer
  versionText: {
    textAlign: 'center',
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    marginBottom: 16,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.errorContainer,
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  signOutText: {
    color: Colors.error,
    fontWeight: '700',
    fontSize: 15,
  },

  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerHighest,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.3,
  },
  textInput: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.onSurface,
  },
  planSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  planPill: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  planPillActive: {
    backgroundColor: Colors.secondaryContainer,
    borderColor: Colors.secondary,
  },
  planPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  planPillTextActive: {
    color: Colors.onSecondaryContainer,
    fontWeight: '700',
  },
  iconPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  iconPickerItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPickerItemActive: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderColor: Colors.secondaryContainer,
    borderWidth: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHighest,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: Colors.errorContainer,
    borderRadius: 12,
    marginRight: 'auto',
  },

  // Manage Account Modal Styles
  accountInfoCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  accountValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  accountToggleBox: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    overflow: 'hidden',
  },
  accountToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  accountToggleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  accountToggleSub: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  accountActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  accountActionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryBrand,
    flex: 1,
  },

  // Warning circle for sign out
  warningCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningSubtext: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
