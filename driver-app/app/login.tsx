import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function LoginScreen() {
  const { login } = useAuth();
  
  const [subdomain, setSubdomain] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!subdomain || !email || !password) {
      Alert.alert('Hata', 'Lütfen kurum kodunu, e-posta adresinizi ve şifrenizi girin.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', 
        { email, password },
        { headers: { 'x-tenant-subdomain': subdomain } }
      );
      
      const sessionUser = response.data.user;
      
      if (!sessionUser || response.data.role !== 'DRIVER') {
          Alert.alert('Dikkat', 'Bu uygulama sadece Sürücü (Driver) hesapları içindir.');
          setLoading(false);
          return;
      }
      
      await login(sessionUser, subdomain);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Giriş Başarısız', e.response?.data?.error || 'Kullanıcı adı veya şifre yanlış.');
    } finally {
      if (loading) setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>Q</Text>
          </View>
          <Text style={styles.title}>Driver Pro</Text>
          <Text style={styles.subtitle}>Sürücü Girişi</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kurum Kodu (Sistem)</Text>
            <TextInput 
              style={styles.input}
              placeholder="Örn: sirketim"
              value={subdomain}
              onChangeText={setSubdomain}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-Posta</Text>
            <TextInput 
              style={styles.input}
              placeholder="Sürücü e-posta adresiniz"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <TextInput 
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginBtnText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 QQX Software. Tüm Hakları Saklıdır.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBox: { width: 64, height: 64, backgroundColor: '#2563eb', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoText: { color: 'white', fontSize: 32, fontWeight: '900' },
  title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 14, fontWeight: '600', color: '#64748b', marginTop: 4 },
  form: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, color: '#0f172a' },
  loginBtn: { backgroundColor: '#2563eb', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  loginBtnText: { color: 'white', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  footer: { marginTop: 'auto', paddingVertical: 24, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#94a3b8', fontWeight: '500' }
});
