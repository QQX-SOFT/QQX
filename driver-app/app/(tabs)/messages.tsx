import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator } from 'react-native';
import { Send, User, MessageSquare } from 'lucide-react-native';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function MessagesTab() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = async () => {
    if (!user?.id) return;
    try {
      const { data } = await api.get('/messages', { 
        params: { senderId: user.id, receiverId: user.id } 
      });
      setMessages(data);
    } catch (e) {
      console.log('Error fetching messages', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [user]);

  const sendMessage = async () => {
    if (!inputText.trim() || !user?.id) return;
    
    const newMsg = {
      senderId: user.id,
      text: inputText.trim(),
    };

    try {
      // Optimistic update
      setMessages([...messages, { ...newMsg, createdAt: new Date().toISOString(), id: 'temp-' + Date.now() }]);
      setInputText('');
      
      await api.post('/messages', newMsg);
      fetchMessages();
    } catch (e) {
      console.log('Error sending message', e);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === user?.id;
    return (
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
        {!isMe && (
          <View style={styles.avatar}>
            <User size={16} color="#64748b" />
          </View>
        )}
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
            {item.text}
          </Text>
          <Text style={styles.timestamp}>
             {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
            <Text style={styles.title}>Destek & Sohbet</Text>
            <Text style={styles.subtitle}>Merkez ile İletişim</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MessageSquare size={48} color="#e2e8f0" />
                <Text style={styles.emptyText}>Henüz mesajınız yok.</Text>
                <Text style={styles.emptySubtext}>Bir sorun yaşarsanız buradan merkeze yazabilirsiniz.</Text>
              </View>
            }
          />
        )}

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Bir mesaj yazın..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1 },
  header: { padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingTop: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 12, fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: 1 },
  
  loadingContainer: { flex:1, justifyContent:'center', alignItems:'center' },
  listContent: { padding: 16, paddingBottom: 32 },
  
  messageRow: { marginBottom: 16, flexDirection: 'row', alignItems: 'flex-end' },
  myMessageRow: { justifyContent: 'flex-end' },
  otherMessageRow: { justifyContent: 'flex-start' },
  
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 18 },
  myBubble: { backgroundColor: '#2563eb', borderBottomRightRadius: 4 },
  otherBubble: { backgroundColor: 'white', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#f1f5f9' },
  
  messageText: { fontSize: 15, lineHeight: 20 },
  myMessageText: { color: 'white' },
  otherMessageText: { color: '#0f172a' },
  
  timestamp: { fontSize: 9, marginTop: 4, opacity: 0.6, textAlign: 'right', fontWeight: 'bold' },
  
  inputArea: { flexDirection: 'row', padding: 12, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f1f5f9', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 10, fontSize: 15, maxHeight: 100 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, fontWeight: '800', color: '#64748b' },
  emptySubtext: { marginTop: 8, fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 40 }
});
