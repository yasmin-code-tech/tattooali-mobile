import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { formatBubbleTime } from '../utils/timeUtils';
import { getJwtSub } from '../lib/jwtSub';
import {
  fetchMessages,
  getOrCreateConversationId,
  resolvePeerAuthId,
  sendChatMessage,
  subscribeToMessages,
  isSupabaseConfigured,
} from '../services/chatService';
import { useConversations } from '../context/ConversationsContext';

const TOKEN_KEY = '@tattooali:token';

function isRemoteUrl(s) {
  return s && /^https?:\/\//i.test(String(s));
}

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { peerAppUserId, peerName, peerAvatar } = route.params || {};
  const peerId = Number.parseInt(String(peerAppUserId ?? ''), 10);

  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);
  const { markAsRead } = useConversations();

  const mySubRef = useRef(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(peerId) || peerId < 1) {
      setError('Contato inválido.');
      setLoading(false);
      return;
    }
    if (!isSupabaseConfigured()) {
      setError('Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.');
      setLoading(false);
      return;
    }
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Faça login novamente.');
      setLoading(false);
      return;
    }
    mySubRef.current = getJwtSub(token);
    setLoading(true);
    setError(null);
    try {
      const peerAuth = await resolvePeerAuthId(token, peerId);
      if (!peerAuth) {
        setError(
          'Este tatuador ainda não sincronizou o chat. Peça para ele abrir o app gestor com Supabase configurado.',
        );
        setLoading(false);
        return;
      }
      const conv = await getOrCreateConversationId(token, peerAuth);
      if (!conv) throw new Error('Não foi possível abrir a conversa.');
      setConversationId(conv);
      markAsRead(conv);
      const rows = await fetchMessages(token, conv);
      setMessages(rows);
    } catch (e) {
      setError(e?.message || 'Falha ao carregar o chat.');
    } finally {
      setLoading(false);
    }
  }, [peerId, markAsRead]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token || !conversationId) return;
      unsub = subscribeToMessages(token, conversationId, (row) => {
        setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
        if (mySubRef.current && row?.sender_id && String(row.sender_id) !== String(mySubRef.current)) {
          markAsRead(conversationId);
        }
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
      });
    })();
    return () => unsub();
  }, [conversationId, markAsRead]);

  useEffect(() => {
    let intervalId = null;
    let cancelled = false;
    (async () => {
      if (!conversationId) return;
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token || cancelled) return;
      intervalId = setInterval(async () => {
        try {
          const rows = await fetchMessages(token, conversationId);
          if (cancelled) return;
          setMessages((prev) => {
            const byId = new Map(prev.map((m) => [m.id, m]));
            for (const row of rows) byId.set(row.id, row);
            return Array.from(byId.values()).sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            );
          });
        } catch {
          // fallback silencioso: tenta novamente no próximo ciclo
        }
      }, 5000);
    })();
    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [conversationId]);

  const displayName = peerName || `Usuário #${peerId}`;
  const showPhoto = isRemoteUrl(peerAvatar);

  // Função para verificar se a mensagem foi visualizada (baseado em heurística: se o contato mandou mensagem depois, ele viu)
  const isMessageRead = (msg) => {
    const msgTime = new Date(msg.created_at).getTime();
    const hasReplyAfter = messages.some(
      (m) => String(m.sender_id) !== String(mySubRef.current) && new Date(m.created_at).getTime() > msgTime
    );
    return hasReplyAfter;
  };

  const renderMessage = ({ item }) => {
    const mine = mySubRef.current && String(item.sender_id) === String(mySubRef.current);
    const read = mine ? isMessageRead(item) : false;

    return (
      <View style={[styles.messageWrapper, mine ? styles.messageWrapperUser : styles.messageWrapperContact]}>
        <View style={[styles.bubble, mine ? styles.bubbleUser : styles.bubbleContact]}>
          <Text style={styles.messageText}>{item.body}</Text>
          <View style={styles.metaContainer}>
            <Text style={styles.timeText}>{formatBubbleTime(item.created_at)}</Text>
            {mine && (
              <Ionicons
                name={read ? "checkmark-done-outline" : "checkmark-outline"}
                size={14}
                color={read ? "#4db8ff" : "rgba(255, 255, 255, 0.5)"}
                style={styles.statusIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !conversationId) return;
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) return;
    setInputText('');
    try {
      const row = await sendChatMessage(token, conversationId, text);
      setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
    } catch {
      setInputText(text);
    }
  };

  if (!Number.isFinite(peerId) || peerId < 1) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.texto}>Contato inválido.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#e53030', fontSize: 16 }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#f0f0f0" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.avatarWrap}>
              {showPhoto ? (
                <Image source={{ uri: peerAvatar }} style={styles.avatarImg} resizeMode="cover" />
              ) : (
                <Text style={styles.avatarEmoji}>💬</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerName} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.offlineStatus}>Chat TattooAli</Text>
            </View>
          </View>
        </View>

        {error ? (
          <View style={{ padding: 16 }}>
            <Text style={{ color: '#f87171', fontSize: 14 }}>{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#e53030" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#555"
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!!conversationId && !error}
          />
          <TouchableOpacity
            style={[styles.sendButton, (inputText.trim().length === 0 || !conversationId) && { opacity: 0.5 }]}
            onPress={handleSend}
            disabled={inputText.trim().length === 0 || !conversationId}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    color: '#f0f0f0',
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#141414',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImg: {
    width: 40,
    height: 40,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  headerName: {
    color: '#f0f0f0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  offlineStatus: {
    color: '#555',
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  messageWrapperUser: {
    justifyContent: 'flex-end',
  },
  messageWrapperContact: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: '#e53030',
    borderBottomRightRadius: 4,
  },
  bubbleContact: {
    backgroundColor: '#2a2a2a',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#f0f0f0',
    fontSize: 15,
    lineHeight: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timeText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
  },
  statusIcon: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#141414',
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  input: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    color: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 50,
    maxHeight: 120,
    marginRight: 12,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e53030',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
