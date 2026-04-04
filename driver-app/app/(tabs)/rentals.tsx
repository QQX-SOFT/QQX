import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  Modal,
  Image,
  Dimensions
} from 'react-native';
import { 
  Car, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  X, 
  ChevronRight, 
  Info,
  Euro,
  Key
} from 'lucide-react-native';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import DrawerShell from '../../components/DrawerShell';

const { width } = Dimensions.get('window');

export default function RentalsTab() {
  const { user } = useAuth();
  const [availableCars, setAvailableCars] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/vehicles');
      setAvailableCars(data.map((v: any, i: number) => ({
        ...v,
        dailyPrice: 45 + (i % 3) * 5,
        status: v.status || 'AVAILABLE'
      })));
    } catch (e) {
      console.log('Error fetching vehicles', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleRequest = (car: any) => {
    setSelectedCar(car);
    setShowModal(true);
  };

  const submitRequest = () => {
    Alert.alert('Erfolg', 'Ihre Mietanfrage wurde an die Zentrale gesendet.');
    setShowModal(false);
    // Add to local mock state to show immediate result
    setMyRequests([{
      id: 'REQ-' + Math.floor(Math.random()*1000),
      carName: `${selectedCar.make} ${selectedCar.model}`,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000*3).toISOString(),
      status: 'PENDING',
      totalPrice: selectedCar.dailyPrice * 3
    }, ...myRequests]);
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.titleSection}>
         <Text style={styles.mainTitle}>Mietwagen</Text>
         <Text style={styles.subTitle}>EXKLUSIVE FLOTTE FÜR PARTNER</Text>
      </View>

      <View style={styles.sectionHeader}>
         <Text style={styles.sectionTitle}>Meine Anträge</Text>
         <Text style={styles.sectionCount}>{myRequests.length} AKTIV</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.horizontalScroll}
        snapToInterval={width * 0.8 + 12}
        decelerationRate="fast"
      >
        {myRequests.map((req, i) => (
          <View key={i} style={styles.requestCard}>
             <View style={styles.requestHeader}>
                <View style={[styles.statusTag, req.status === 'PENDING' ? styles.statusPending : styles.statusApproved]}>
                   <Text style={styles.statusText}>{req.status === 'PENDING' ? 'WARTEND' : 'BESTÄTIGT'}</Text>
                </View>
                <Text style={styles.requestId}>#{req.id}</Text>
             </View>
             <Text style={styles.requestCarName}>{req.carName}</Text>
             <View style={styles.datesRow}>
                <Calendar size={12} color="#94a3b8" />
                <Text style={styles.datesText}>Abonnement • 3 Tage</Text>
             </View>
             <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>TOTAL</Text>
                <Text style={styles.priceValue}>€{req.totalPrice.toFixed(2)}</Text>
             </View>
             <View style={styles.decorIcon}>
                {req.status === 'PENDING' ? <Clock size={80} color="#f59e0b" opacity={0.05} /> : <ShieldCheck size={80} color="#10b981" opacity={0.05} />}
             </View>
          </View>
        ))}
        {myRequests.length === 0 && (
          <View style={styles.emptyRequest}>
             <Key size={32} color="#cbd5e1" />
             <Text style={styles.emptyRequestText}>Keine aktiven Mietverträge</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.sectionHeader, { marginTop: 32 }]}>
         <Text style={styles.sectionTitle}>Verfügbare Fahrzeuge</Text>
      </View>
    </View>
  );

  return (
    <DrawerShell title="Mietwagen">
      <FlatList
        data={availableCars}
        ListHeaderComponent={renderHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={fetchVehicles}
        renderItem={({ item }) => (
          <View style={styles.carCard}>
             <View style={styles.carInfoRow}>
                <View style={styles.carIconBox}>
                   <Car size={32} color="#94a3b8" />
                </View>
                <View style={styles.carText}>
                   <View style={styles.carNameRow}>
                      <Text style={styles.carName}>{item.make} {item.model}</Text>
                      <View style={styles.carPriceBox}>
                         <Text style={styles.carPriceSub}>PRO TAG</Text>
                         <Text style={styles.carPrice}>€{item.dailyPrice.toFixed(2)}</Text>
                      </View>
                   </View>
                   <View style={styles.carMetaRow}>
                      <View style={styles.activeDot} />
                      <Text style={styles.carMetaText}>SOFORT VERFÜGBAR • {item.licensePlate}</Text>
                   </View>
                </View>
             </View>
             <TouchableOpacity style={styles.requestBtn} onPress={() => handleRequest(item)}>
                <Text style={styles.requestBtnText}>JETZT ANFRAGEN</Text>
             </TouchableOpacity>
          </View>
        )}
      />

      {/* Request Modal */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
         <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBlur} onPress={() => setShowModal(false)} />
            <View style={styles.modalContent}>
               <View style={styles.modalHandle} />
               {selectedCar && (
                  <>
                     <Text style={styles.modalTitle}>Mietanfrage</Text>
                     <Text style={styles.modalSub}>{selectedCar.make} {selectedCar.model} reservieren</Text>
                     
                     <View style={styles.summaryBox}>
                        <View style={styles.summaryItem}>
                           <Euro size={20} color="#2563eb" />
                           <View>
                              <Text style={styles.summaryLabel}>GESCHÄTZTER GESAMTPREIS</Text>
                              <Text style={styles.summaryValue}>€{(selectedCar.dailyPrice * 3).toFixed(2)} <Text style={{fontSize: 12, color: '#94a3b8'}}>(3 Tage)</Text></Text>
                           </View>
                        </View>
                     </View>

                     <TouchableOpacity style={styles.submitBtn} onPress={submitRequest}>
                        <Text style={styles.submitBtnText}>VERBINDLICH ANFRAGEN</Text>
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
  listContainer: { paddingHorizontal: 16, paddingBottom: 40, backgroundColor: '#f8fafc' },
  headerContent: { paddingTop: 24 },
  titleSection: { marginBottom: 32 },
  mainTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  subTitle: { fontSize: 10, fontWeight: '900', color: '#2563eb', letterSpacing: 1.5, marginTop: 4 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  sectionCount: { fontSize: 10, fontWeight: '900', color: '#0f172a' },
  
  horizontalScroll: { paddingHorizontal: 4, gap: 12 },
  requestCard: {
    width: width * 0.8,
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#64748b',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden'
  },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusPending: { backgroundColor: '#fff7ed' },
  statusApproved: { backgroundColor: '#f0fdf4' },
  statusText: { fontSize: 8, fontWeight: '900', color: '#d97706' },
  requestId: { fontSize: 10, fontWeight: '900', color: '#cbd5e1' },
  requestCarName: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  datesRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  datesText: { fontSize: 11, fontWeight: '700', color: '#94a3b8' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 16, borderRadius: 20, marginTop: 24 },
  priceLabel: { fontSize: 9, fontWeight: '900', color: '#94a3b8' },
  priceValue: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  decorIcon: { position: 'absolute', bottom: -20, right: -20 },
  
  emptyRequest: { 
    width: width * 0.8, 
    height: 180, 
    borderWidth: 1, 
    borderStyle: 'dashed', 
    borderColor: '#cbd5e1', 
    borderRadius: 36, 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 12
  },
  emptyRequestText: { fontSize: 12, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },

  carCard: { backgroundColor: 'white', padding: 24, borderRadius: 36, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10 },
  carInfoRow: { flexDirection: 'row', gap: 20, marginBottom: 24 },
  carIconBox: { width: 64, height: 64, backgroundColor: '#f8fafc', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  carText: { flex: 1 },
  carNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  carName: { fontSize: 20, fontWeight: '900', color: '#0f172a', flex: 1 },
  carPriceBox: { alignItems: 'flex-end' },
  carPriceSub: { fontSize: 8, fontWeight: '900', color: '#94a3b8' },
  carPrice: { fontSize: 16, fontWeight: '900', color: '#2563eb' },
  carMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981' },
  carMetaText: { fontSize: 9, fontWeight: '900', color: '#94a3b8' },
  requestBtn: { backgroundColor: '#0f172a', paddingVertical: 16, borderRadius: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  requestBtnText: { color: 'white', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.4)' },
  modalBlur: { flex: 1 },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 32, paddingBottom: 48 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#f1f5f9', borderRadius: 10, alignSelf: 'center', marginBottom: 32 },
  modalTitle: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
  modalSub: { fontSize: 14, fontWeight: '600', color: '#64748b', marginTop: 4, marginBottom: 32 },
  summaryBox: { backgroundColor: '#eff6ff', padding: 24, borderRadius: 32, marginBottom: 32 },
  summaryItem: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  summaryLabel: { fontSize: 9, fontWeight: '900', color: '#3b82f6', letterSpacing: 1 },
  summaryValue: { fontSize: 24, fontWeight: '900', color: '#0f172a', marginTop: 4 },
  submitBtn: { backgroundColor: '#2563eb', paddingVertical: 20, borderRadius: 24, alignItems: 'center', shadowColor: '#2563eb', shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },
  submitBtnText: { color: 'white', fontSize: 12, fontWeight: '900', letterSpacing: 2 }
});
