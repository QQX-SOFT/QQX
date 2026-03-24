import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, SafeAreaView, RefreshControl, TouchableOpacity } from 'react-native';
import api from '../../lib/api';
import OrderCard, { Order } from '../../components/OrderCard';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../hooks/useLocation';

export default function MarketTab() {
  const { user } = useAuth();
  const { location, errorMsg, activeTimeEntryId } = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/available').catch(() => ({ data: [] }));
      setOrders(data);
    } catch (e) {
      console.log('Error fetching available orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAcceptOrder = async (order: Order) => {
    if (!user?.id) return;
    if (!activeTimeEntryId) {
       Alert.alert('Hata', 'Lütfen önce mesaiye (şifte) başlayın!');
       return;
    }
    try {
      await api.patch(`/orders/${order.id}/assign`, { driverId: user.id });
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      Alert.alert('Erfolg', 'Auftrag erfolgreich angenommen!');
    } catch (e) {
      Alert.alert('Fehler', 'Fehler beim Annehmen des Auftrags.');
    }
  };

  const toggleShift = async () => {
    if (!user?.id) return;
    try {
      if (activeTimeEntryId) {
        // Stop shift
        await api.patch(`/time/stop/${activeTimeEntryId}`, { lat: location?.lat, lng: location?.lng });
        Alert.alert('Bilgi', 'Mesai bitirildi, konum takibi durduruldu.');
      } else {
        // Start shift
        await api.post(`/time/start`, { driverId: user.id, lat: location?.lat, lng: location?.lng });
        Alert.alert('Bilgi', 'Mesai başladı! Canlı konum merkeze iletiliyor.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Mesai durumu değiştirilemedi.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Marktplatz</Text>
            <Text style={styles.subtitle}>Verfügbare Aufträge</Text>
          </View>
          
          <TouchableOpacity 
            onPress={toggleShift} 
            style={[styles.shiftBtn, activeTimeEntryId ? styles.shiftActive : styles.shiftInactive]}
          >
            <View style={[styles.shiftDot, activeTimeEntryId ? { backgroundColor: 'white' } : { backgroundColor: '#ef4444' }]} />
            <Text style={[styles.shiftBtnText, activeTimeEntryId ? { color: 'white' } : { color: '#ef4444' }]}>
              {activeTimeEntryId ? 'Mesai Aktif' : 'Mesai Kapalı'}
            </Text>
          </TouchableOpacity>
        </View>

        {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={orders}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} />}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <OrderCard
                order={item}
                onPress={(o) => {
                  Alert.alert(
                    'Auftrag Annehmen',
                    `Möchtest du den Auftrag von ${o.senderName || 'Abholung'} annehmen?`,
                    [
                      { text: 'Abbrechen', style: 'cancel' },
                      { text: 'Annehmen', onPress: () => handleAcceptOrder(o) },
                    ]
                  );
                }}
              />
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Şu an uygun görev yok</Text>
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
  title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 12, fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: 1 },
  shiftBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  shiftActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  shiftInactive: { backgroundColor: '#fee2e2', borderColor: '#f87171' },
  shiftBtnText: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  shiftDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  errorBox: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#b91c1c', fontSize: 12, fontWeight: '700' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
});
