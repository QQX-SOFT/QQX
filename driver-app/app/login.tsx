import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Mail, Lock, LogIn, Eye, EyeOff, Truck } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte geben Sie Ihre E-Mail-Adresse und Ihr Passwort ein.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', 
        { email, password }
      );
      
      const sessionUser = response.data.user;
      const resolvedSubdomain = response.data.subdomain;
      
      if (!sessionUser || response.data.role !== 'DRIVER') {
          Alert.alert('Achtung', 'Diese App ist nur für Fahrer-Accounts (Driver) bestimmt.');
          setLoading(false);
          return;
      }
      
      await login(sessionUser, resolvedSubdomain);
    } catch (e: any) {
      console.error(e);
      Alert.alert(
        'Anmeldung fehlgeschlagen', 
        e.response?.data?.error || 'E-Mail oder Passwort ist falsch.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Truck size={42} color="#ffffff" strokeWidth={2} />
              </View>
              <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.title}>QQX Driver</Text>
            <Text style={styles.subtitle}>Melden Sie sich an, um zu beginnen</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>E-Mail</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="name@beispiel.at"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Passwort</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput 
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#64748b" />
                  ) : (
                    <Eye size={20} color="#64748b" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]} 
              onPress={handleLogin} 
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.loginBtnText}>Anmelden</Text>
                  <LogIn size={20} color="white" style={styles.btnIcon} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 QQX Software</Text>
            <Text style={styles.footerSubText}>Alle Rechte vorbehalten</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  container: { 
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 50 
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logoCircle: { 
    width: 84, 
    height: 84, 
    backgroundColor: '#2563eb', 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  logoBadge: {
    position: 'absolute',
    bottom: -5,
    right: -10,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#f8fafc',
  },
  logoBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#0f172a',
    letterSpacing: -0.5
  },
  subtitle: { 
    fontSize: 15, 
    fontWeight: '500', 
    color: '#64748b', 
    marginTop: 6 
  },
  form: { 
    width: '100%' 
  },
  inputWrapper: {
    marginBottom: 24,
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#334155', 
    marginBottom: 8,
    marginLeft: 4
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: { 
    flex: 1,
    fontSize: 16, 
    color: '#0f172a',
    fontWeight: '500'
  },
  eyeIcon: {
    padding: 8,
  },
  loginBtn: { 
    backgroundColor: '#2563eb', 
    height: 60,
    borderRadius: 18, 
    justifyContent: 'center',
    alignItems: 'center', 
    marginTop: 10, 
    shadowColor: '#2563eb', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 12, 
    elevation: 6 
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: { 
    color: 'white', 
    fontSize: 17, 
    fontWeight: '700', 
    marginRight: 8
  },
  btnIcon: {
    marginLeft: 4,
  },
  footer: { 
    marginTop: 50,
    alignItems: 'center' 
  },
  footerText: { 
    fontSize: 13, 
    color: '#94a3b8', 
    fontWeight: '600' 
  },
  footerSubText: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 2,
  }
});
