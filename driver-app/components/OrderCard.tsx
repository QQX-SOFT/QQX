import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, ChevronRight, Euro } from 'lucide-react-native';

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
  // Assuming a 40% driver cut for display
  const driverCut = (order.amount * 0.4).toFixed(2);

  return (
    <TouchableOpacity 
        style={styles.card} 
        onPress={() => onPress(order)}
        activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={styles.iconContainer}>
          <MapPin size={22} color="#2563eb" strokeWidth={2} />
        </View>
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>{sender}</Text>
          <View style={styles.addressRow}>
             <Text style={styles.address} numberOfLines={1}>{order.address}</Text>
          </View>
        </View>
      </View>
      <View style={styles.right}>
        <View style={styles.priceContainer}>
           <Text style={styles.priceLabel}>VERDIENST</Text>
           <Text style={styles.price}>€{driverCut}</Text>
        </View>
        <ChevronRight size={18} color="#cbd5e1" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  left: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  details: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  title: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: '#0f172a',
    marginBottom: 2
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  address: { 
    fontSize: 12, 
    fontWeight: '500', 
    color: '#64748b',
    maxWidth: '90%'
  },
  right: { 
    flexDirection: 'row',
    alignItems: 'center', 
    gap: 8
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginRight: 4
  },
  priceLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 1
  },
  price: { 
    fontSize: 18, 
    fontWeight: '900', 
    color: '#16a34a' 
  },
});
