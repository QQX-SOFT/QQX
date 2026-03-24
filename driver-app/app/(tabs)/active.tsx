import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import api from '../../lib/api';
import OrderCard, { Order } from '../../components/OrderCard';
import SignatureScreen from 'react-native-signature-canvas';
import { useAuth } from '../../context/AuthContext';

export default function ActiveTab() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingOrder, setSigningOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data } = await api.get('/orders').catch(() => ({ data: [] }));
      const activeOrds = data.filter((o: any) => o.driverId === user.id && (o.status === 'ACCEPTED' || o.status === 'ON_THE_WAY'));
      setOrders(activeOrds);
    } catch (e) {
      console.log('Error fetching active orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleStartOrder = async (order: Order) => {
    try {
      await api.patch(`/orders/${order.id}/status`, { status: 'ON_THE_WAY' });
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: 'ON_THE_WAY' } : o));
      Alert.alert('Fahrt gestartet', 'Viel Erfolg!');
    } catch (e) {
      Alert.alert('Fehler', 'Fehler beim Starten der Fahrt.');
    }
  };

  const handleFinishOrder = async (signature: string) => {
    if (!signingOrder) return;
    try {
      await api.patch(`/orders/${signingOrder.id}/status`, { status: 'DELIVERED', deliverySig: signature });
      setOrders((prev) => prev.filter((o) => o.id !== signingOrder.id));
      setSigningOrder(null);
      Alert.alert('Erfolg', 'Auftrag erfolgreich beendet!');
    } catch (e) {
      Alert.alert('Fehler', 'Fehler beim Beenden des Auftrags.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Angenommene Aufträge</Text>
          <Text style={styles.subtitle}>Aktive Route</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={orders}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} />}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.wrapper}>
                <OrderCard
                  order={item}
                  onPress={(o) => {
                    if (o.status === 'ACCEPTED') {
                      Alert.alert('Auftrag Starten', 'Möchten Sie die Fahrt jetzt starten?', [
                        { text: 'Abbrechen', style: 'cancel' },
                        { text: 'Starten', onPress: () => handleStartOrder(o) },
                      ]);
                    } else if (o.status === 'ON_THE_WAY') {
                      setSigningOrder(o);
                    }
                  }}
                />
                {item.status === 'ON_THE_WAY' && (
                  <TouchableOpacity style={styles.finishBtn} onPress={() => setSigningOrder(item)}>
                    <Text style={styles.finishBtnText}>✅ Auftrag Beenden</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'ACCEPTED' && (
                  <TouchableOpacity style={styles.startBtn} onPress={() => handleStartOrder(item)}>
                    <Text style={styles.startBtnText}>🚀 Auftrag Starten</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Keine aktiven Aufträge</Text>
              </View>
            }
          />
        )}
      </View>

      <Modal visible={!!signingOrder} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Unterschrift des Kunden</Text>
            <View style={{ height: 300, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden' }}>
              <SignatureScreen
                onOK={(sig) => handleFinishOrder(sig)}
                onEmpty={() => Alert.alert("Fehler", "Bitte unterschreiben")}
                clearText="Leeren"
                confirmText="Speichern"
                autoClear={false}
              />
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setSigningOrder(null)}>
              <Text style={styles.cancelBtnText}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 20, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 12, fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: 1 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
  wrapper: { marginBottom: 16 },
  startBtn: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: -8, marginBottom: 8 },
  startBtnText: { color: 'white', fontWeight: '800', fontSize: 14, textTransform: 'uppercase' },
  finishBtn: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: -8, marginBottom: 8 },
  finishBtnText: { color: 'white', fontWeight: '800', fontSize: 14, textTransform: 'uppercase' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, minHeight: 500 },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 16, textAlign: 'center' },
  cancelBtn: { marginTop: 16, padding: 16, alignItems: 'center' },
  cancelBtnText: { color: '#ef4444', fontWeight: 'bold' }
});
