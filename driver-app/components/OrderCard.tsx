import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Package } from 'lucide-react-native';

export type Order = {
  id: string;
  customerName?: string;
  senderName?: string;
  tenant?: { name: string };
  address: string;
  amount: number;
  status: "PENDING" | "ACCEPTED" | "ON_THE_WAY" | "DELIVERED";
  createdAt: string;
};

type Props = {
  order: Order;
  onPress: (order: Order) => void;
};

export default function OrderCard({ order, onPress }: Props) {
  const sender = order.senderName || order.tenant?.name || "Abholung";
  const driverCut = (order.amount * 0.4).toFixed(2);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(order)}>
      <View style={styles.left}>
        <View style={styles.iconContainer}>
          <Package size={20} color="#2563eb" />
        </View>
        <View style={styles.details}>
          <Text style={styles.title}>{sender}</Text>
          <Text style={styles.address} numberOfLines={1}>{order.address}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>€{driverCut}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: { flex: 1, paddingRight: 8 },
  title: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  address: { fontSize: 12, fontWeight: '500', color: '#64748b' },
  right: { alignItems: 'flex-end', justifyContent: 'center', height: '100%' },
  price: { fontSize: 16, fontWeight: '800', color: '#16a34a' },
});
