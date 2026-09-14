import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Route, Calendar, Clock, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '../theme';
import { Header } from '../components/common/Header';
import { CompletedTrip } from '../context/NavigationContext';

interface TripsScreenProps {
  onSelectTrip?: (tripId: string) => void;
  trips: CompletedTrip[];
}

interface RecentTrip {
  id: string;
  from: string;
  to: string;
  date: string;
  distanceKm: number;
  durationMin: number;
  outageDurationFormatted: string;
  completed: boolean;
}

const PAST_TRIPS = [
  {
    id: '1',
    from: 'Pune Railway Station',
    to: 'Shivaji Nagar, Pune',
    date: 'Today, 10:30 AM',
    distance: '8.2 km',
    duration: '22 min',
    outageAvoided: '1m 45s DR near MG Road',
    failoverStatus: 'High-Rate IMU Active',
  },
  {
    id: '2',
    from: 'Baner, Pune',
    to: 'Hinjewadi IT Park',
    date: 'Today, 8:15 AM',
    distance: '15.7 km',
    duration: '38 min',
    outageAvoided: '2m 30s DR under flyover',
    failoverStatus: 'Optical Flow Assist',
  },
  {
    id: '3',
    from: 'Kothrud, Pune',
    to: 'Katraj, Pune',
    date: 'Yesterday, 6:45 PM',
    distance: '12.4 km',
    duration: '28 min',
    outageAvoided: '45s DR in tunnel',
    failoverStatus: 'Zero Drift Offset',
  },
];

export const TripsScreen: React.FC<TripsScreenProps> = ({ onSelectTrip, trips }) => {
  const recentTrips: RecentTrip[] = trips.length > 0
    ? trips.map((trip) => ({
      id: trip.id,
      from: trip.from || 'Selected Pune start',
      to: trip.to || 'Selected destination',
      completed: trip.completed,
      date: trip.date,
      distanceKm: trip.distanceKm,
      durationMin: trip.durationMin,
      outageDurationFormatted: trip.outageDurationFormatted,
    }))
    : PAST_TRIPS.map((trip) => ({
    id: trip.id,
    from: trip.from,
    to: trip.to,
    date: trip.date,
    distanceKm: Number.parseFloat(trip.distance),
    durationMin: trip.duration.includes('h') ? 70 : Number.parseInt(trip.duration, 10),
    outageDurationFormatted: trip.outageAvoided,
    completed: true,
  }));
  return (
    <View style={styles.container}>
      <Header title="Trip History" showProfile={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBox}>
          <Text style={[Typography.headlineLgMobile, styles.title]}>Past Navigation Logs</Text>
          <Text style={[Typography.bodyMd, styles.subtitle]}>
            Audit log with verified GNSS vs. AI Dead Reckoning telemetry records.
          </Text>
        </View>

        <View style={styles.tripList}>
          {recentTrips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripCard}
              onPress={() => onSelectTrip && onSelectTrip(trip.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <View style={styles.routeHeader}>
                  <View style={styles.pinDot} />
                  <Text style={[Typography.titleLg, styles.fromText]} numberOfLines={1}>
                    {trip.from}
                  </Text>
                </View>
                <View style={styles.routeArrow} />
                <View style={styles.routeHeader}>
                  <View style={[styles.pinDot, styles.pinDotEnd]} />
                  <Text style={[Typography.titleLg, styles.toText]} numberOfLines={1}>
                    {trip.to}
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Calendar size={14} color={Colors.onSurfaceVariant} />
                  <Text style={[Typography.labelSm, styles.metaText]}>{trip.date}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={14} color={Colors.onSurfaceVariant} />
                  <Text style={[Typography.labelSm, styles.metaText]}>{trip.durationMin} min</Text>
                </View>
                <View style={styles.metaItem}>
                  <Route size={14} color={Colors.onSurfaceVariant} />
                  <Text style={[Typography.labelSm, styles.metaText]}>{trip.distanceKm} km</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.failoverChip}>
                  <CheckCircle2 size={13} color={Colors.secondary} />
                  <Text style={[Typography.labelSm, styles.failoverText]}>{trip.outageDurationFormatted}</Text>
                </View>
                <View style={styles.footerRight}>
                  <Text style={[styles.statusText, trip.completed ? styles.completedText : styles.endedText]}>
                    {trip.completed ? 'Trip completed' : 'Trip ended early'}
                  </Text>
                  <ChevronRight size={18} color={Colors.outline} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
  },
  headerBox: {
    marginBottom: 20,
  },
  title: {
    color: Colors.onSurface,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  tripList: {
    gap: 16,
  },
  tripCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHighest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    marginBottom: 12,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryBrand,
  },
  pinDotEnd: {
    backgroundColor: Colors.secondaryContainer,
  },
  routeArrow: {
    width: 2,
    height: 14,
    backgroundColor: Colors.surfaceContainerHighest,
    marginLeft: 4,
    marginVertical: 2,
  },
  fromText: {
    color: Colors.onSurface,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  toText: {
    color: Colors.onSurface,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.surfaceContainerLow,
    marginVertical: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    color: Colors.onSurfaceVariant,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  failoverChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  failoverText: {
    color: Colors.secondary,
    fontWeight: '700',
    fontSize: 10,
  },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  completedText: { color: '#32963b' },
  endedText: { color: Colors.secondary },
});
