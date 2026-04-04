import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Send, User, MessageSquare, CheckCheck, ArrowLeft, MoreVertical, Paperclip } from 'lucide-react-native';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import DrawerShell from '../../components/DrawerShell';

const QUICK_REPLIES = ["In 5 Min zurück", "Unterwegs 👋", "Danke!", "👍", "Hilfe nötig"];

export default function MessagesTab() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = async () => {
    if (!user?.id) return;
    try {
      const { data } = await api.get('/messages');
      setMessages(data);
    } catch (e) {
      console.log('Error fetching messages', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const sendMessage = async (textOverride?: string) => {
    const finalContent = textOverride || inputText;
    if (!finalContent.trim() || !user?.id) return;
    
    const newMsg = {
      senderId: user.id,
      text: finalContent.trim(),
    };

    try {
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
      <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.otherMessageWrapper]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myText : styles.otherText]}>{item.text}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.timeText}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isMe && <CheckCheck size={12} color="#3b82f6" style={{ marginLeft: 4 }} />}
        </View>
      </View>
    );
  };

  return (
    <DrawerShell title="Nachrichten">
      <View style={styles.chatHeader}>
         <View style={styles.headerLeft}>
            <View style={styles.avatarPlaceholder}>
               <Text style={styles.avatarText}>ZA</Text>
               <View style={styles.onlineDot} />
            </View>
            <View>
               <Text style={styles.headerTitle}>Zentrale (Admin)</Text>
               <Text style={styles.headerSub}>DISPATCHER • ONLINE</Text>
            </View>
         </View>
         <TouchableOpacity>
            <MoreVertical size={20} color="#94a3b8" />
         </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={() => (
             <View style={styles.dayDivider}>
                <Text style={styles.dayText}>HEUTE</Text>
             </View>
          )}
          ListEmptyComponent={
            loading ? null : (
              <View style={styles.empty}>
                <MessageSquare size={48} color="#e2e8f0" />
                <Text style={styles.emptyText}>Keine Nachrichten</Text>
              </View>
            )
          }
        />

        <View style={styles.footer}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickReplies}>
              {QUICK_REPLIES.map((reply, i) => (
                 <TouchableOpacity 
                   key={i} 
                   style={styles.replyPill}
                   onPress={() => sendMessage(reply)}
                 >
                    <Text style={styles.replyText}>{reply}</Text>
                 </TouchableOpacity>
              ))}
           </ScrollView>

           <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.attachBtn}>
                 <Paperclip size={20} color="#94a3b8" />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Nachricht schreiben..."
                value={inputText}
                onChangeText={setInputText}
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity 
                style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
                onPress={() => sendMessage()}
                disabled={!inputText.trim()}
              >
                <Send size={18} color="white" />
              </TouchableOpacity>
           </View>
        </View>
      </KeyboardAvoidingView>
    </DrawerShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: { color: 'white', fontWeight: '900', fontSize: 16 },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    backgroundColor: '#10b981',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white'
  },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  headerSub: { fontSize: 8, fontWeight: '900', color: '#3b82f6', letterSpacing: 1 },
  
  listContent: { padding: 20, paddingBottom: 40 },
  dayDivider: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  dayText: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 9,
    fontWeight: '900',
    color: '#94a3b8',
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  
  messageWrapper: { marginBottom: 20, maxWidth: '85%' },
  myMessageWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  otherMessageWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  
  bubble: { padding: 16, borderRadius: 24 },
  myBubble: { backgroundColor: '#2563eb', borderBottomRightRadius: 4 },
  otherBubble: { backgroundColor: 'white', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#f1f5f9' },
  
  messageText: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  myText: { color: 'white' },
  otherText: { color: '#0f172a' },
  
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, paddingHorizontal: 4 },
  timeText: { fontSize: 8, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
  
  footer: { 
    padding: 20, 
    backgroundColor: 'white', 
    borderTopWidth: 1, 
    borderTopColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15
  },
  quickReplies: { marginBottom: 16 },
  replyPill: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  replyText: { fontSize: 10, fontWeight: '900', color: '#64748b' },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  attachBtn: { padding: 12 },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  sendBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#2563eb',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  sendBtnDisabled: { backgroundColor: '#e2e8f0', shadowOpacity: 0 },
  
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100, opacity: 0.3 },
  emptyText: { marginTop: 12, fontSize: 14, fontWeight: '900', color: '#64748b' }
});
