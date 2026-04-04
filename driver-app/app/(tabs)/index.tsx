import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  RefreshControl, 
  TouchableOpacity,
  Modal
} from 'react-native';
import api from '../../lib/api';
import { Order } from '../../components/OrderCard';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../hooks/useLocation';
import DrawerShell from '../../components/DrawerShell';
import { 
  Package, 
  MapPin, 
  User as UserIcon, 
  Info, 
  Play,
  Clock,
  Wallet,
} from 'lucide-react-native';

export default function MarketTab() {
  const { user } = useAuth();
  const { location, activeTimeEntryId } = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ earnings: 0, ordersCount: 0 });
  const [displayName, setDisplayName] = useState(user?.firstName || 'Fahrer');
  const [sortBy, setSortBy] = useState<'money' | 'distance'>('money');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const ordRes = await api.get('/orders/available').catch(() => ({ data: [] }));
      setOrders(ordRes.data);

      if (user?.id) {
         const driverRes = await api.get('/drivers/me').catch(() => null);
         if (driverRes?.data) {
            setStats({
               earnings: driverRes.data.walletBalance || 0,
               ordersCount: driverRes.data.stats?.todayOrders || 0
            });
            if (driverRes.data.firstName) {
               setDisplayName(driverRes.data.firstName);
            }
         }
      }
    } catch (e) {
      console.log('Error fetching dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleAcceptOrder = async (id: string) => {
    if (!activeTimeEntryId) {
       Alert.alert('Fehler', 'Bitte starten Sie zuerst Ihre Schicht!');
       return;
    }
    try {
      await api.patch(`/orders/${id}/assign`, { driverId: user?.id });
      setOrders(prev => prev.filter(o => o.id !== id));
      setSelectedOrder(null);
      Alert.alert('Erfolg', 'Auftrag angenommen! Er ist nun in deinem aktiven Bereich.');
    } catch (e) {
      Alert.alert('Fehler', 'Auftrag konnte nicht angenommen werden.');
    }
  };

  const toggleShift = async () => {
    if (!user?.id) return;
    try {
      if (activeTimeEntryId) {
        await api.patch(`/time/stop/${activeTimeEntryId}`, { lat: location?.lat, lng: location?.lng });
        Alert.alert('Info', 'Schicht beendet.');
      } else {
        await api.post(`/time/start`, { driverId: user.id, lat: location?.lat, lng: location?.lng });
        Alert.alert('Info', 'Schicht gestartet!');
      }
      fetchDashboardData();
    } catch (e) {
      Alert.alert('Fehler', 'Status konnte nicht geändert werden.');
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortBy === 'money') return b.amount - a.amount;
    return (a.address || '').localeCompare(b.address || ''); 
  });

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.greetingRow}>
         <View>
            <Text style={styles.greetingTitle}>Hallo, {displayName}! 👋</Text>
            <Text style={styles.greetingSubtitle}>Bereit für deine heutige Schicht?</Text>
         </View>
      </View>

      <View style={styles.statsOverview}>
         <View style={styles.statBox}>
            <Text style={styles.statLabel}>VERDIENST</Text>
            <Text style={styles.statValue}>€{stats.earnings.toFixed(2)}</Text>
         </View>
         <View style={styles.statDivider} />
         <View style={styles.statBox}>
            <Text style={styles.statLabel}>AUFTRÄGE</Text>
            <Text style={styles.statValue}>{stats.ordersCount}</Text>
         </View>
      </View>

      <TouchableOpacity 
        onPress={toggleShift}
        style={[styles.heroCard, activeTimeEntryId ? styles.heroActive : styles.heroInactive]}
      >
         <View style={styles.heroLeft}>
            <View style={styles.heroIconCircle}>
               {activeTimeEntryId ? <Clock size={24} color="#10b981" /> : <Play size={24} color="#2563eb" fill="#2563eb" />}
            </View>
            <View>
               <Text style={styles.heroTitle}>{activeTimeEntryId ? 'Schicht aktif' : 'Schicht starten'}</Text>
               <Text style={styles.heroSubtitle}>{activeTimeEntryId ? 'Standort wird live übertragen' : 'Klicken, um GPS zu aktivieren'}</Text>
            </View>
         </View>
         <View style={styles.heroStatus}>
            <View style={[styles.pulseDot, { backgroundColor: 'white' }]} />
            <Text style={styles.heroStatusText}>{activeTimeEntryId ? 'ONLINE' : 'OFFLINE'}</Text>
         </View>
      </TouchableOpacity>

      <View style={styles.marketHeader}>
         <View>
            <Text style={styles.marketTitle}>Marktplatz</Text>
            <Text style={styles.marketSubtitle}>LIVE AUFTRÄGE</Text>
         </View>
         <View style={styles.sortToggle}>
            <TouchableOpacity 
               onPress={() => setSortBy('money')}
               style={[styles.sortBtn, sortBy === 'money' && styles.sortBtnActive]}
            >
               <Text style={[styles.sortBtnText, sortBy === 'money' && styles.sortBtnTextActive]}>$$$</Text>
            </TouchableOpacity>
            <TouchableOpacity 
               onPress={() => setSortBy('distance')}
               style={[styles.sortBtn, sortBy === 'distance' && styles.sortBtnActive]}
            >
               <Text style={[styles.sortBtnText, sortBy === 'distance' && styles.sortBtnTextActive]}>KM</Text>
            </TouchableOpacity>
         </View>
      </View>
    </View>
  );

  return (
    <DrawerShell title="Marktplatz">
      <FlatList
        data={sortedOrders}
        ListHeaderComponent={renderHeader}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardData} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.orderCard}
            onPress={() => setSelectedOrder(item)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Package size={24} color="#2563eb" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.senderName}>{item.senderName || 'Abholung'}</Text>
                <Text style={styles.orderAddress} numberOfLines={1}>{item.address}</Text>
              </View>
              <View style={styles.amountBox}>
                <Text style={styles.amountText}>€{(item.amount * 0.4).toFixed(2)}</Text>
                <Text style={styles.nettoLabel}>NETTO</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Package size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>Keine verfügbaren Aufträge</Text>
            </View>
          )
        }
      />

      <Modal visible={!!selectedOrder} animationType="slide" transparent={true}>
         <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBlur} onPress={() => setSelectedOrder(null)} />
            <View style={styles.modalContent}>
               <View style={styles.modalHandle} />
               
               {selectedOrder && (
                  <>
                     <View style={styles.modalHeader}>
                        <View style={styles.modalIconBox}>
                           <Package size={28} color="white" />
                        </View>
                        <View>
                           <Text style={styles.modalSub}>Detailauftrag</Text>
                           <Text style={styles.modalTitle}>{selectedOrder.senderName || 'Abholung'}</Text>
                        </View>
                        <View style={styles.modalAmountBox}>
                           <Text style={styles.modalAmountSub}>Netto Verdienst</Text>
                           <Text style={styles.modalAmount}>€{(selectedOrder.amount * 0.4).toFixed(2)}</Text>
                        </View>
                     </View>

                     <View style={styles.infoSection}>
                        <View style={styles.infoItem}>
                           <MapPin size={20} color="#94a3b8" />
                           <View>
                              <Text style={styles.infoLabel}>LIEFERADRESSE</Text>
                              <Text style={styles.infoValue}>{selectedOrder.address}</Text>
                           </View>
                        </View>
                        <View style={styles.infoItem}>
                           <UserIcon size={20} color="#94a3b8" />
                           <View>
                              <Text style={styles.infoLabel}>KUNDE</Text>
                              <Text style={styles.infoValue}>{selectedOrder.customerName || 'Unbekannt'}</Text>
                           </View>
                        </View>
                        <View style={styles.infoItem}>
                           <Info size={20} color="#94a3b8" />
                           <View>
                              <Text style={styles.infoLabel}>STATUS</Text>
                              <Text style={styles.infoValue}>Wartend</Text>
                           </View>
                        </View>
                     </View>

                     <TouchableOpacity 
                        style={styles.acceptBtn}
                        onPress={() => handleAcceptOrder(selectedOrder.id)}
                     >
                        <Text style={styles.acceptBtnText}>AUFTRAG ANNEHMEN</Text>
                     </TouchableOpacity>
                  </>
               )}
            </View>
         </View>
      </Modal>
    </DrawerShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40, backgroundColor: '#f8fafc' },
  headerContent: { paddingTop: 24 },
  greetingRow: { marginBottom: 20 },
  greetingTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  greetingSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  statsOverview: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    flexDirection: 'row',
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#334155', marginHorizontal: 20 },
  statLabel: { fontSize: 9, fontWeight: '900', color: '#64748b', letterSpacing: 1, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '900', color: 'white' },
  heroCard: {
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8
  },
  heroInactive: { backgroundColor: '#2563eb', shadowColor: '#2563eb' },
  heroActive: { backgroundColor: '#10b981', shadowColor: '#10b981' },
  heroLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroIconCircle: { width: 52, height: 52, backgroundColor: 'white', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  heroTitle: { color: 'white', fontSize: 16, fontWeight: '900' },
  heroSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  heroStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pulseDot: { width: 6, height: 6, borderRadius: 3 },
  heroStatusText: { color: 'white', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  marketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  marketTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  marketSubtitle: { fontSize: 10, fontWeight: '900', color: '#2563eb', letterSpacing: 1.5, marginTop: 2 },
  sortToggle: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 4, borderRadius: 14 },
  sortBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  sortBtnActive: { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  sortBtnText: { fontSize: 10, fontWeight: '900', color: '#94a3b8' },
  sortBtnTextActive: { color: '#0f172a' },
  orderCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 48, height: 48, backgroundColor: '#eff6ff', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  senderName: { fontSize: 15, fontWeight: '900', color: '#0f172a' },
  orderAddress: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  amountBox: { alignItems: 'flex-end' },
  amountText: { fontSize: 16, fontWeight: '900', color: '#10b981' },
  nettoLabel: { fontSize: 8, fontWeight: '900', color: '#94a3b8', letterSpacing: 0.5 },
  empty: { padding: 80, alignItems: 'center', opacity: 0.5 },
  emptyText: { fontSize: 14, fontWeight: '900', color: '#64748b', marginTop: 16 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.4)' },
  modalBlur: { flex: 1 },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#f1f5f9', borderRadius: 10, alignSelf: 'center', marginBottom: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  modalIconBox: { width: 56, height: 56, backgroundColor: '#2563eb', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  modalSub: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  modalAmountBox: { flex: 1, alignItems: 'flex-end' },
  modalAmountSub: { fontSize: 9, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
  modalAmount: { fontSize: 24, fontWeight: '900', color: '#10b981' },
  infoSection: { backgroundColor: '#f8fafc', borderRadius: 24, padding: 20, gap: 20, marginBottom: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  infoItem: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  infoLabel: { fontSize: 9, fontWeight: '900', color: '#94a3b8', letterSpacing: 1 },
  infoValue: { fontSize: 15, fontWeight: '900', color: '#334155', marginTop: 2 },
  acceptBtn: { backgroundColor: '#2563eb', padding: 20, borderRadius: 24, alignItems: 'center', shadowColor: '#2563eb', shadowOpacity: 0.2, shadowRadius: 15, elevation: 5 },
  acceptBtnText: { color: 'white', fontWeight: '900', fontSize: 14, letterSpacing: 1 }
});
