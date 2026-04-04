import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react-native';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import DrawerShell from '../components/DrawerShell';

export default function ShiftsPage() {
  const { user } = useAuth();
  const [availableShifts, setAvailableShifts] = useState<any[]>([]);
  const [myShifts, setMyShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'available' | 'my'>('available');

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const [availRes, myRes] = await Promise.all([
        api.get('/shifts/available'),
        api.get('/shifts/my-shifts')
      ]);
      setAvailableShifts(availRes.data);
      setMyShifts(myRes.data);
    } catch (e) {
      console.log('Error fetching shifts', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [user]);

  const handleBook = async (id: string) => {
    try {
      await api.post(`/shifts/${id}/book`);
      Alert.alert('Erfolg', 'Schicht erfolgreich gebucht!');
      fetchShifts();
    } catch (e: any) {
        const msg = e.response?.data?.error || 'Buchung fehlgeschlagen.';
        Alert.alert('Fehler', msg);
    }
  };

  const renderShift = ({ item }: { item: any }) => {
    const start = new Date(item.startTime);
    const end = new Date(item.endTime);
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.areaBadge}>
            <MapPin size={12} color="#2563eb" />
            <Text style={styles.areaText}>{item.area.name}</Text>
          </View>
          <Text style={styles.dateText}>
            {start.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' })}
          </Text>
        </View>

        <View style={styles.timeRow}>
          <Clock size={16} color="#64748b" />
          <Text style={styles.timeText}>
            {start.getHours().toString().padStart(2, '0')}:{start.getMinutes().toString().padStart(2, '0')} - {end.getHours().toString().padStart(2, '0')}:{end.getMinutes().toString().padStart(2, '0')}
          </Text>
        </View>

        {tab === 'available' ? (
          <TouchableOpacity style={styles.bookBtn} onPress={() => handleBook(item.id)}>
            <Text style={styles.bookBtnText}>JETZT BUCHEN</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.bookedBadge}>
            <CheckCircle2 size={16} color="#10b981" />
            <Text style={styles.bookedText}>GEBUCHT</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <DrawerShell title="Schichtplan">
      <View style={styles.container}>
        <View style={styles.tabBar}>
          <TouchableOpacity 
            onPress={() => setTab('available')}
            style={[styles.tab, tab === 'available' && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === 'available' && styles.tabTextActive]}>VERFÜGBAR</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setTab('my')}
            style={[styles.tab, tab === 'my' && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === 'my' && styles.tabTextActive]}>MEINE SCHICHTEN</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={tab === 'available' ? availableShifts : myShifts}
          renderItem={renderShift}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchShifts} />}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Calendar size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>Keine Schichten gefunden</Text>
              </View>
            ) : null
          }
        />
      </View>
    </DrawerShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  tabBar: { flexDirection: 'row', backgroundColor: 'white', padding: 8, marginHorizontal: 16, marginTop: 16, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 14 },
  tabActive: { backgroundColor: '#2563eb', shadowColor: '#2563eb', shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  tabText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1 },
  tabTextActive: { color: 'white' },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  areaBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6 },
  areaText: { fontSize: 10, fontWeight: '900', color: '#2563eb', textTransform: 'uppercase' },
  dateText: { fontSize: 14, fontWeight: '900', color: '#0f172a' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  timeText: { fontSize: 15, fontWeight: '900', color: '#334155' },
  bookBtn: { backgroundColor: '#0f172a', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  bookBtnText: { color: 'white', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  bookedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4', paddingVertical: 14, borderRadius: 16, gap: 8 },
  bookedText: { color: '#10b981', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  empty: { padding: 80, alignItems: 'center', opacity: 0.5 },
  emptyText: { fontSize: 14, fontWeight: '900', color: '#64748b', marginTop: 16 }
});
