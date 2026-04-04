import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  Dimensions, 
  SafeAreaView, 
  ScrollView,
  Platform
} from 'react-native';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Clock, 
  Package, 
  CheckCircle2, 
  MessageSquare, 
  Key, 
  User, 
  LogOut,
  ChevronRight
} from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

type Props = {
  children: React.ReactNode;
  title: string;
};

export default function DrawerShell({ children, title }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const slideAnim = React.useRef(new Animated.Value(-width)).current;

  const toggleDrawer = () => {
    if (isOpen) {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsOpen(false));
    } else {
      setIsOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const navigateTo = (path: any) => {
    toggleDrawer();
    router.push(path);
  };

  const handleLogout = () => {
    toggleDrawer();
    logout();
  };

  const navItems = [
    { label: 'Dashboard', sub: 'SCHICHT & AUFTRÄGE', icon: LayoutDashboard, path: '/(tabs)' },
    { label: 'Zeitübersicht', icon: Clock, path: '/(tabs)/active' },
    { label: 'Verfügbare Aufträge', icon: Package, path: '/(tabs)' },
    { label: 'Angenommene Aufträge', icon: Package, path: '/(tabs)/active' },
    { label: 'Absolvierte Aufträge', icon: CheckCircle2, path: '/(tabs)/history' },
    { label: 'Nachrichten', icon: MessageSquare, path: '/(tabs)/messages' },
    { label: 'Mieten', icon: Key, path: '/(tabs)/rentals' },
    { label: 'Profil', icon: User, path: '/(tabs)' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
             <Menu size={24} color="#0f172a" />
          </TouchableOpacity>
          <View style={styles.logoAndTitle}>
             <View style={styles.miniLogo}><Text style={styles.miniLogoText}>Q</Text></View>
             <Text style={styles.headerTitle}>{title}</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn}>
             <User size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        {children}
      </View>

      {isOpen && (
        <Modal transparent visible={isOpen} animationType="none">
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.backdrop} 
              activeOpacity={1} 
              onPress={toggleDrawer} 
            />
            <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
              <SafeAreaView style={styles.drawerSafe}>
                <View style={styles.drawerHeader}>
                   <View style={styles.drawerLogoRow}>
                      <View style={styles.drawerLogoBox}><Text style={styles.drawerLogoText}>Q</Text></View>
                      <Text style={styles.drawerBrand}>QQX DRIVER</Text>
                   </View>
                   <TouchableOpacity onPress={toggleDrawer} style={styles.closeBtn}>
                      <X size={24} color="#64748b" />
                   </TouchableOpacity>
                </View>

                <ScrollView style={styles.drawerNav} showsVerticalScrollIndicator={false}>
                  {navItems.map((item, index) => {
                    const isActive = (pathname === item.path && index === 0);
                    return (
                      <TouchableOpacity 
                        key={index} 
                        style={[styles.navItem, isActive ? styles.navItemActive : null]}
                        onPress={() => navigateTo(item.path)}
                      >
                        <View style={styles.navItemLeft}>
                           <View style={[styles.navIconBox, isActive ? styles.navIconBoxActive : null]}>
                              <item.icon size={20} color={isActive ? 'white' : '#64748b'} />
                           </View>
                           <View>
                              <Text style={[styles.navLabel, isActive ? styles.navLabelActive : null]}>{item.label}</Text>
                              {item.sub && <Text style={[styles.navSub, isActive ? styles.navSubActive : null]}>{item.sub}</Text>}
                           </View>
                        </View>
                        {isActive && <ChevronRight size={16} color="white" />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <View style={styles.drawerFooter}>
                   <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                      <LogOut size={20} color="#ef4444" />
                      <Text style={styles.logoutText}>ABMELDEN</Text>
                   </TouchableOpacity>
                </View>
              </SafeAreaView>
            </Animated.View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerSafe: { 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 50
  },
  header: { 
    height: 70, // Yüksekliği arttırdık
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, // Kenar boşluklarını arttırdık
    marginTop: Platform.OS === 'android' ? 10 : 0 // Android için ekstra üst boşluk
  },
  menuBtn: { padding: 8 },
  logoAndTitle: { flexDirection: 'row', alignItems: 'center' },
  miniLogo: { width: 32, height: 32, backgroundColor: '#2563eb', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  miniLogoText: { color: 'white', fontWeight: '900', fontSize: 16 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  profileBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  
  content: { flex: 1 },

  modalOverlay: { flex: 1, flexDirection: 'row' },
  backdrop: { position: 'absolute', top:0, left:0, right:0, bottom:0, backgroundColor: 'rgba(15, 23, 42, 0.5)' },
  drawer: { width: '85%', maxWidth: 320, backgroundColor: 'white', height: '100%', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20 },
  drawerSafe: { flex: 1 },
  drawerHeader: { padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  drawerLogoRow: { flexDirection: 'row', alignItems: 'center' },
  drawerLogoBox: { width: 40, height: 40, backgroundColor: '#2563eb', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  drawerLogoText: { color: 'white', fontWeight: '900', fontSize: 20 },
  drawerBrand: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  closeBtn: { padding: 4 },

  drawerNav: { flex: 1, paddingHorizontal: 16 },
  navItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 14, 
    borderRadius: 20, 
    marginBottom: 8 
  },
  navItemActive: { 
    backgroundColor: '#2563eb',
  },
  navItemLeft: { flexDirection: 'row', alignItems: 'center' },
  navIconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    backgroundColor: '#f8fafc', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 14
  },
  navIconBoxActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  navLabel: { fontSize: 15, fontWeight: '700', color: '#334155' },
  navLabelActive: { color: 'white' },
  navSub: { fontSize: 9, fontWeight: '900', color: '#94a3b8', letterSpacing: 0.5, marginTop: 1 },
  navSubActive: { color: 'rgba(255,255,255,0.6)' },

  drawerFooter: { padding: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  logoutBtn: { 
    backgroundColor: '#fff1f2', 
    padding: 16, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  logoutText: { color: '#ef4444', fontWeight: '900', fontSize: 13, letterSpacing: 1, marginLeft: 10 }
});
