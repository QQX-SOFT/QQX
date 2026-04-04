import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import api from '../../lib/api';
import OrderCard, { Order } from '../../components/OrderCard';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react-native';

export default function HistoryTab() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data } = await api.get('/orders').catch(() => ({ data: [] }));
      const completedOrds = data.filter((o: any) => o.driverId === user.id && o.status === 'DELIVERED');
      setOrders(completedOrds);
    } catch (e) {
      console.log('Error fetching history orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleLogout = () => {
    Alert.alert('Abmelden', 'Sind Sie sicher, dass Sie sich abmelden möchten?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Abmelden', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Historie</Text>
            <Text style={styles.subtitle}>Absolvierte Aufträge</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut color="#ef4444" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>Heute abgeschlossen</Text>
          <Text style={styles.statsValue}>{orders.length}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={orders}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} />}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <OrderCard order={item} onPress={() => {}} />
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Keine Aufgaben in der Historie</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 20, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 12, fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: 1 },
  logoutBtn: { padding: 8, backgroundColor: '#fee2e2', borderRadius: 12 },
  statsCard: { backgroundColor: '#2563eb', padding: 20, borderRadius: 16, marginBottom: 20 },
  statsLabel: { color: '#bfdbfe', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  statsValue: { color: 'white', fontSize: 32, fontWeight: '900', marginTop: 4 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
});
