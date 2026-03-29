import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Importando o seu contexto e o seu utilitário de tempo
import { useConversations } from '../context/ConversationsContext';
import { formatBubbleTime } from '../utils/timeUtils'; // Ajuste o caminho se necessário

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Pegamos as funções do seu contexto
  const { getContact, sendMessage } = useConversations();

  // Pegamos o ID do contato que foi passado na navegação
  const { contactId } = route.params || {};
  
  // Buscamos todas as informações do tatuador (incluindo as mensagens)
  const contact = getContact(contactId);

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  // Se por acaso abrir sem um contato válido, mostramos um erro amigável
  if (!contact) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.texto}>Contato não encontrado.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#e53030', fontSize: 16 }}>Voltar para Contatos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Função para enviar a mensagem
  const handleSend = () => {
    if (inputText.trim().length > 0) {
      sendMessage(contactId, inputText.trim());
      setInputText(''); // Limpa a caixa de texto depois de enviar
    }
  };

  // Como desenhar cada balão de mensagem
  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperContact]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleContact]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.timeText}>{formatBubbleTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── HEADER (Topo da tela) ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#f0f0f0" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarEmoji}>{contact.avatar}</Text>
            </View>
            <View>
              <Text style={styles.headerName}>{contact.name}</Text>
              {contact.isOnline ? (
                <Text style={styles.onlineStatus}>Online agora</Text>
              ) : (
                <Text style={styles.offlineStatus}>Offline</Text>
              )}
            </View>
          </View>
        </View>

        {/* ── LISTA DE MENSAGENS ── */}
        <FlatList
          ref={flatListRef}
          data={contact.messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          // Faz a lista rolar para baixo automaticamente quando abre ou chega nova mensagem
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* ── CAIXA DE DIGITAR ── */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#555"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, inputText.trim().length === 0 && { opacity: 0.5 }]} 
            onPress={handleSend}
            disabled={inputText.trim().length === 0}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── ESTILOS ──
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
  
  // Header
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
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  headerName: {
    color: '#f0f0f0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  onlineStatus: {
    color: '#10b981', // Verde
    fontSize: 12,
  },
  offlineStatus: {
    color: '#555',
    fontSize: 12,
  },

  // Lista de Mensagens
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
    backgroundColor: '#e53030', // Vermelho do seu tema
    borderBottomRightRadius: 4,
  },
  bubbleContact: {
    backgroundColor: '#2a2a2a', // Cinza escuro
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#f0f0f0',
    fontSize: 15,
    lineHeight: 20,
  },
  timeText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },

  // Input
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
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 40,
    maxHeight: 100,
    marginRight: 12,
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