import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  TouchableOpacity, 
  RefreshControl, 
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { 
  Clock, 
  TrendingUp, 
  Wallet, 
  Calendar, 
  ChevronRight,
  Filter,
  ArrowRight
} from 'lucide-react-native';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import DrawerShell from '../../components/DrawerShell';

const { width } = Dimensions.get('window');

type FilterType = 'week' | 'month' | 'year';

export default function ActiveTab() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('week');
  const [driverId, setDriverId] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Get driver ID if not already known
      let dId = driverId;
      if (!dId) {
        const { data: driverData } = await api.get('/drivers/me');
        dId = driverData.id;
        setDriverId(dId);
      }

      const now = new Date();
      let start = new Date(now);
      const end = new Date(now);
      end.setDate(end.getDate() + 1);

      if (filter === 'week') {
          start.setDate(now.getDate() - 7);
      } else if (filter === 'month') {
          start.setMonth(now.getMonth() - 1);
      } else if (filter === 'year') {
          start.setFullYear(now.getFullYear() - 1);
      }

      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];

      const { data: reportData } = await api.get(`/reports/driver/${dId}?start=${startStr}&end=${endStr}`);
      setStats(reportData);
    } catch (e) {
      console.log('Error fetching stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user, filter]);

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        {(['week', 'month', 'year'] as FilterType[]).map((t) => (
          <TouchableOpacity 
            key={t}
            onPress={() => setFilter(t)}
            style={[styles.filterPill, filter === t && styles.filterPillActive]}
          >
            <Text style={[styles.filterText, filter === t && styles.filterTextActive]}>
              {t === 'week' ? 'Woche' : t === 'month' ? 'Monat' : 'Jahr'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Stats Card */}
      <View style={styles.mainCard}>
        <View style={styles.mainCardContent}>
          <View>
            <Text style={styles.cardInfoLabel}>Gearbeitete Stunden</Text>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursValue}>{stats?.summary?.totalHours || '0.00'}</Text>
              <Text style={styles.hoursUnit}> h</Text>
            </View>
            <Text style={styles.cardInfoSub}>{stats?.summary?.totalDays || 0} Arbeitstage im Zeitraum</Text>
          </View>
          <View style={styles.iconCircle}>
            <Clock size={32} color="white" />
          </View>
        </View>
        <View style={styles.cardDecoration} />
      </View>

      {/* Grid Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.miniCard}>
          <View style={[styles.miniIconBox, { backgroundColor: '#f0fdf4' }]}>
            <Wallet size={20} color="#16a34a" />
          </View>
          <Text style={styles.miniLabel}>Verdienst</Text>
          <Text style={styles.miniValue}>€{stats?.summary?.totalEarnings || '0.00'}</Text>
        </View>

        <View style={styles.miniCard}>
          <View style={[styles.miniIconBox, { backgroundColor: '#fff7ed' }]}>
            <TrendingUp size={20} color="#d97706" />
          </View>
          <Text style={styles.miniLabel}>Verrechnet</Text>
          <Text style={styles.miniValue}>{stats?.summary?.totalHours || '0.00'} h</Text>
        </View>
      </View>

      {/* History List Title */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.listTitle}>Verlauf</Text>
        <Text style={styles.listCount}>{stats?.entries?.length || 0} Einträge</Text>
      </View>
    </View>
  );

  return (
    <DrawerShell title="Zeitübersicht">
      <FlatList
        data={stats?.entries || []}
        ListHeaderComponent={renderHeader}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStats} />}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.scrollContainer}
        renderItem={({ item, index }) => (
          <View style={styles.entryCard}>
            <View style={styles.entryLeft}>
              <View style={styles.dateBox}>
                <Text style={styles.dateDay}>{item.date.split('.')[0]}</Text>
                <Text style={styles.dateMonth}>{item.date.split('.')[1]}.{item.date.split('.')[2].slice(2,4)}</Text>
              </View>
              <View>
                <Text style={styles.entryMainText}>{(item.durationMinutes/60).toFixed(2)} h gearbeitet</Text>
                <Text style={styles.entrySubText}>{item.startTime} - {item.endTime}</Text>
              </View>
            </View>
            <View style={styles.entryRight}>
               <Text style={styles.entryEarnings}>€{item.earnings.toFixed(2)}</Text>
               <Text style={styles.entryEarningsLabel}>UMSATZ</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyContainer}>
               <Calendar size={42} color="#cbd5e1" />
               <Text style={styles.emptyText}>Keine Zeiteinträge gefunden</Text>
            </View>
          )
        }
      />
    </DrawerShell>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    backgroundColor: '#f8fafc'
  },
  headerContent: {
    paddingTop: 24,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 24,
    alignSelf: 'flex-start'
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  filterPillActive: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  filterText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  filterTextActive: {
    color: 'white'
  },
  mainCard: {
    backgroundColor: '#0f172a',
    borderRadius: 36,
    padding: 32,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10
  },
  mainCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10
  },
  cardInfoLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  hoursValue: {
    color: 'white',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1
  },
  hoursUnit: {
    color: '#64748b',
    fontSize: 18,
    fontWeight: '900'
  },
  cardInfoSub: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4
  },
  iconCircle: {
    width: 64,
    height: 64,
    backgroundColor: '#2563eb',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowRadius: 15
  },
  cardDecoration: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    backgroundColor: '#2563eb20',
    borderRadius: 75,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32
  },
  miniCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2
  },
  miniIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  miniLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  miniValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a'
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a'
  },
  listCount: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase'
  },
  entryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 5
  },
  entryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  dateBox: {
    width: 44,
    height: 44,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  dateDay: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 16
  },
  dateMonth: {
    fontSize: 8,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase'
  },
  entryMainText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#334155'
  },
  entrySubText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 2
  },
  entryRight: {
    alignItems: 'flex-end'
  },
  entryEarnings: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a'
  },
  entryEarningsLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 0.5
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    opacity: 0.5
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#64748b',
    marginTop: 12,
    textAlign: 'center'
  }
});
