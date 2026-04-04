import React from 'react';
import { Tabs } from 'expo-router';

/**
 * Tab tabanli navigasyonu Drawer ile değiştirdiğimiz için 
 * bottom nav bar'ı tamamen gizliyoruz. 
 * Sidebar Drawer özelliği DrawerShell bileşeni ile sayfa bazlı sağlanacak.
 */
export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: '#2563eb',
        tabBarStyle: { display: 'none' }, // Navbar gizli
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="active" />
      <Tabs.Screen name="wallet" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="history" />
    </Tabs>
  );
}
