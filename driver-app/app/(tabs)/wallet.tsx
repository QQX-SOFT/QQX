import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, SafeAreaView, Alert } from 'react-native';
import { Wallet, TrendingUp, Star, Download, CheckCircle2, Clock } from 'lucide-react-native';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

import DrawerShell from '../../components/DrawerShell';

export default function WalletTab() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverId, setDriverId] = useState<string | null>(null);

  const fetchWalletData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const driverRes = await api.get('/drivers/me');
      setBalance(driverRes.data.walletBalance || 0);
      setDriverId(driverRes.data.id);

      const payoutsRes = await api.get('/payouts').catch(() => ({ data: [] }));
      const myPayouts = payoutsRes.data.filter((p: any) => p.driverId === driverRes.data.id);
      
      setPayouts(myPayouts);
    } catch (e) {
      console.log('Error fetching wallet data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [user]);

  const requestPayout = async () => {
    if (balance <= 0) {
      Alert.alert('Fehler', 'Sie haben kein auszahlbares Guthaben.');
      return;
    }
    Alert.alert('Auszahlung', `Möchten Sie eine Auszahlung Ihres gesamten Guthabens (€${balance.toFixed(2)}) anfordern?`, [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Anfordern', onPress: async () => {
        try {
          await api.post('/payouts', { driverId, amount: balance, notes: "App Payout Request" });
          Alert.alert('Erfolg', 'Ihre Auszahlungsanfrage wurde erstellt.');
          fetchWalletData();
        } catch(e) {
          Alert.alert('Fehler', 'Anfrage konnte nicht erstellt werden.');
        }
      }}
    ]);
  };

  return (
    <DrawerShell title="Geldbörse">
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchWalletData} />}
      >
        {/* Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardLabel}>Aktuelles Guthaben</Text>
              <Text style={styles.balanceText}>€{balance.toFixed(2)}</Text>
            </View>
            <View style={styles.walletIconBox}>
              <Wallet size={32} color="white" />
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.payoutBtn} onPress={requestPayout}>
              <Text style={styles.payoutBtnText}>Auszahlung</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailsBtn}>
              <Text style={styles.detailsBtnText}>Transaktionen</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <View style={styles.statIconWrap}>
               <TrendingUp size={24} color="#2563eb" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Lieferverdienst</Text>
              <Text style={styles.statValue}>€{balance.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statIconWrapAlt}>
               <Star size={24} color="#d97706" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Trinkgeld (Bar/Karte)</Text>
              <Text style={styles.statValue}>€0.00</Text>
            </View>
          </View>
        </View>

        {/* Payouts */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Zahlungshistorie</Text>
          
          {payouts.length === 0 ? (
            <View style={styles.empty}>
               <Text style={styles.emptyText}>Sie haben noch keine Auszahlungsanfragen.</Text>
            </View>
          ) : (
            payouts.map((p) => (
              <View key={p.id} style={styles.historyCard}>
                 <View style={[styles.statusIcon, p.status === 'PAID' ? styles.statusIconPaid : styles.statusIconPending]}>
                   {p.status === 'PAID' ? <CheckCircle2 size={24} color="#16a34a" /> : <Clock size={24} color="#2563eb" />}
                 </View>
                 <View style={styles.historyDetails}>
                    <View style={styles.historyRow}>
                      <Text style={styles.historyAmount}>€{p.amount.toFixed(2)}</Text>
                      <View style={[styles.badge, p.status === 'PAID' ? styles.badgePaid : styles.badgePending]}>
                         <Text style={[styles.badgeText, p.status === 'PAID' ? styles.badgeTextPaid : styles.badgeTextPending]}>
                            {p.status === 'PAID' ? 'Bezahlt' : p.status === 'PENDING' ? 'Ausstehend' : p.status}
                         </Text>
                      </View>
                    </View>
                    <Text style={styles.historyDate}>Datum: {new Date(p.createdAt).toLocaleDateString()}</Text>
                 </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </DrawerShell>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 20, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 12, fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: 1 },
  
  walletCard: { backgroundColor: '#0f172a', padding: 24, borderRadius: 28, shadowColor: '#1e3a8a', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 10, marginBottom: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
  cardLabel: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },
  balanceText: { fontSize: 48, fontWeight: '900', color: 'white', letterSpacing: -2 },
  walletIconBox: { width: 56, height: 56, backgroundColor: '#2563eb', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  
  actionRow: { flexDirection: 'row', gap: 12 },
  payoutBtn: { flex: 1, backgroundColor: 'white', paddingVertical: 16, borderRadius: 20, alignItems: 'center' },
  payoutBtnText: { color: '#0f172a', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  detailsBtn: { flex: 1, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', paddingVertical: 16, borderRadius: 20, alignItems: 'center' },
  detailsBtnText: { color: '#e2e8f0', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },

  statsContainer: { gap: 16, marginBottom: 30 },
  statBox: { backgroundColor: 'white', padding: 20, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  statIconWrap: { width: 48, height: 48, backgroundColor: '#eff6ff', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statIconWrapAlt: { width: 48, height: 48, backgroundColor: '#fef3c7', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statContent: { flex: 1 },
  statLabel: { fontSize: 11, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '900', color: '#0f172a' },

  historySection: { paddingBottom: 40 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 16 },
  historyCard: { backgroundColor: 'white', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  statusIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statusIconPaid: { backgroundColor: '#f0fdf4' },
  statusIconPending: { backgroundColor: '#eff6ff' },
  historyDetails: { flex: 1 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  historyAmount: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgePaid: { backgroundColor: '#f0fdf4' },
  badgePending: { backgroundColor: '#eff6ff' },
  badgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  badgeTextPaid: { color: '#16a34a' },
  badgeTextPending: { color: '#2563eb' },
  historyDate: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },

  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, fontWeight: '800', color: '#94a3b8' }
});
