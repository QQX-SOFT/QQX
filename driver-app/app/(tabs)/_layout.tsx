import React from 'react';
import { Tabs } from 'expo-router';
import { Package, Truck, Clock, Wallet, MessageCircle } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2563eb', headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Marktplatz',
          tabBarIcon: ({ color }) => <Package size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="active"
        options={{
          title: 'Route',
          tabBarIcon: ({ color }) => <Truck size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Cüzdan',
          tabBarIcon: ({ color }) => <Wallet size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Destek',
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historie',
          tabBarIcon: ({ color }) => <Clock size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
