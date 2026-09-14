import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Home, Navigation as NavIcon, Route as RouteIcon, Settings, User } from 'lucide-react-native';
import { Colors, Typography } from '../theme';

import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { PermissionsPrompt } from '../components/PermissionsPrompt';
import { HomeScreen } from '../screens/HomeScreen';
import { NavigationScreen } from '../screens/NavigationScreen';
import { DemoConsoleScreen } from '../screens/DemoConsoleScreen';
import { TripSummaryScreen } from '../screens/TripSummaryScreen';
import { TripsScreen } from '../screens/TripsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RoutePlannerScreen } from '../screens/RoutePlannerScreen';
import { useNavigation } from '../context/NavigationContext';

type RootState =
  | 'SPLASH'
  | 'ONBOARDING'
  | 'AUTH'
  | 'MAIN'
  | 'LIVE_NAV'
  | 'DEMO_CONSOLE'
  | 'TRIP_SUMMARY'
  | 'MAP_VIEW'
  | 'ROUTE_PLANNER';

type TabState = 'HOME' | 'NAVIGATE' | 'TRIPS' | 'SETTINGS' | 'PROFILE';

export const AppNavigator: React.FC = () => {
  const [rootState, setRootState] = useState<RootState>('SPLASH');
  const [activeTab, setActiveTab] = useState<TabState>('HOME');
  const [profile, setProfile] = useState({ name: 'Atharva Teli', email: '', plan: 'NavGuard Pro' });
  const [selectedTripCompleted, setSelectedTripCompleted] = useState(true);
  const [summaryOpenedFromTrips, setSummaryOpenedFromTrips] = useState(false);
  const [permissionsVisible, setPermissionsVisible] = useState(false);
  const { completedTrips } = useNavigation();

  useEffect(() => {
    const loadProfile = async () => {
      const [name, email, plan] = await Promise.all([
        AsyncStorage.getItem('profileName'),
        AsyncStorage.getItem('profileEmail'),
        AsyncStorage.getItem('profilePlan'),
      ]);
      setProfile({
        name: name || 'Atharva Teli',
        email: email || '',
        plan: plan || 'NavGuard Pro',
      });
    };
    void loadProfile();
  }, []);

  // 1. Splash Screen
  if (rootState === 'SPLASH') {
    return <SplashScreen onFinish={() => setRootState('ONBOARDING')} />;
  }


  
  // 2. Onboarding Carousel
  if (rootState === 'ONBOARDING') {
    return <OnboardingScreen onComplete={() => setRootState('AUTH')} />;
  }

  if (rootState === 'AUTH') {
    return (
      <AuthScreen
        onAuthenticated={(name, email) => {
          setProfile((current) => ({ ...current, name, email }));
          setRootState('MAIN');
          setPermissionsVisible(true);
        }}
      />
    );
  }

  // 4. Dedicated Fullscreen Live Navigation
  if (rootState === 'LIVE_NAV') {
    return (
      <NavigationScreen
        onBack={() => setRootState('MAIN')}
        onFinishTrip={() => {
          setSummaryOpenedFromTrips(false);
          setRootState('TRIP_SUMMARY');
        }}
        inTabMode={false}
      />
    );
  }

  // 5. Hackathon & Dev Simulation Console
  if (rootState === 'DEMO_CONSOLE') {
    return <DemoConsoleScreen onBack={() => setRootState('MAIN')} />;
  }

  // 6. Post-Trip Diagnostic Summary
  if (rootState === 'TRIP_SUMMARY') {
    return (
      <TripSummaryScreen
        completed={selectedTripCompleted}
        onDone={() => {
          if (summaryOpenedFromTrips) {
            setActiveTab('TRIPS');
            setRootState('MAIN');
          } else {
            setActiveTab('HOME');
            setRootState('MAP_VIEW');
          }
        }}
      />
    );
  }

  if (rootState === 'MAP_VIEW') {
    return (
      <NavigationScreen
        mapOnly
        onBack={() => {
          setActiveTab('HOME');
          setRootState('MAIN');
        }}
        onFinishTrip={() => undefined}
      />
    );
  }

  if (rootState === 'ROUTE_PLANNER') {
    return <RoutePlannerScreen onBack={() => setRootState('MAIN')} onRouteStarted={() => setRootState('LIVE_NAV')} />;
  }

  // 7. Main Dashboard with Bottom Navigation Bar matching Stitch Material 3
  return (
    <View style={styles.mainContainer}>
      {/* Active Tab Screen Content */}
      <View style={styles.tabContent}>
        {activeTab === 'HOME' && (
          <HomeScreen
            onStartNav={() => setRootState('ROUTE_PLANNER')}
            onOpenDemo={() => setRootState('DEMO_CONSOLE')}
            onOpenTrips={() => setActiveTab('TRIPS')}
            onOpenSettings={() => setActiveTab('SETTINGS')}
            onOpenProfile={() => setActiveTab('PROFILE')}
            profile={profile}
          />
        )}
        {activeTab === 'NAVIGATE' && (
          <NavigationScreen
            onBack={() => {
              setActiveTab('HOME');
              setRootState('MAIN');
            }}
            onFinishTrip={() => setRootState('TRIP_SUMMARY')}
            inTabMode={true}
          />
        )}
        {activeTab === 'TRIPS' && (
          <TripsScreen
            trips={completedTrips}
            onSelectTrip={(tripId) => {
              const trip = completedTrips.find((item) => item.id === tripId);
              setSelectedTripCompleted(trip?.completed ?? true);
              setSummaryOpenedFromTrips(true);
              setRootState('TRIP_SUMMARY');
            }}
          />
        )}
        {activeTab === 'SETTINGS' && (
          <SettingsScreen onOpenDemo={() => setRootState('DEMO_CONSOLE')} />
        )}
        {activeTab === 'PROFILE' && (
          <ProfileScreen onProfileUpdated={setProfile} />
        )}
      </View>
      <PermissionsPrompt
        visible={permissionsVisible}
        onAccept={() => {
          setPermissionsVisible(false);
        }}
      />

      {/* Persistent Mobile Bottom Navigation Bar matching Stitch Design */}
      <View style={styles.bottomNav}>
        {/* Home Tab */}
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'HOME' && styles.activePill]}
          onPress={() => setActiveTab('HOME')}
          activeOpacity={0.8}
        >
          <Home
            size={20}
            color={activeTab === 'HOME' ? Colors.onSecondaryContainer : Colors.onSurfaceVariant}
          />
          <Text
            style={[
              Typography.labelSm,
              styles.navLabel,
              { color: activeTab === 'HOME' ? Colors.onSecondaryContainer : Colors.onSurfaceVariant },
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* Navigate Tab */}
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'NAVIGATE' && styles.activePill]}
          onPress={() => {
            setActiveTab('HOME');
            setRootState('ROUTE_PLANNER');
          }}
          activeOpacity={0.8}
        >
          <NavIcon
            size={20}
            color={activeTab === 'NAVIGATE' ? Colors.onSecondaryContainer : Colors.onSurfaceVariant}
          />
          <Text
            style={[
              Typography.labelSm,
              styles.navLabel,
              { color: activeTab === 'NAVIGATE' ? Colors.onSecondaryContainer : Colors.onSurfaceVariant },
            ]}
          >
            Navigate
          </Text>
        </TouchableOpacity>

        {/* Trips Tab */}
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'TRIPS' && styles.activePill]}
          onPress={() => setActiveTab('TRIPS')}
          activeOpacity={0.8}
        >
          <RouteIcon
            size={20}
            color={activeTab === 'TRIPS' ? Colors.onSecondaryContainer : Colors.onSurfaceVariant}
          />
          <Text
            style={[
              Typography.labelSm,
              styles.navLabel,
              { color: activeTab === 'TRIPS' ? Colors.onSecondaryContainer : Colors.onSurfaceVariant },
            ]}
          >
            Trips
          </Text>
        </TouchableOpacity>

        {/* Settings Tab */}
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'SETTINGS' && styles.activePill]}
          onPress={() => setActiveTab('SETTINGS')}
          activeOpacity={0.8}
        >
          <Settings
            size={20}
            color={activeTab === 'SETTINGS' ? Colors.onSecondaryContainer : Colors.onSurfaceVariant}
          />
          <Text
            style={[
              Typography.labelSm,
              styles.navLabel,
              { color: activeTab === 'SETTINGS' ? Colors.onSecondaryContainer : Colors.onSurfaceVariant },
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>

        {/* Profile Tab */}
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'PROFILE' && styles.activePill]}
          onPress={() => setActiveTab('PROFILE')}
          activeOpacity={0.8}
        >
          <User
            size={20}
            color={activeTab === 'PROFILE' ? Colors.onSecondaryContainer : Colors.onSurfaceVariant}
          />
          <Text
            style={[
              Typography.labelSm,
              styles.navLabel,
              { color: activeTab === 'PROFILE' ? Colors.onSecondaryContainer : Colors.onSurfaceVariant },
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabContent: {
    flex: 1,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHighest,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 24,
    gap: 2,
  },
  activePill: {
    backgroundColor: Colors.secondaryContainer,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
