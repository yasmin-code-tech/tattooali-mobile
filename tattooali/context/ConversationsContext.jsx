import React, { createContext, useContext, useState, useCallback } from 'react';


// ─── MOCK DATA ────────────────────────────────────────────────
const MOCK_CONVERSATIONS = [
  {
    id:              '1',
    name:            'Rafael Ink',
    avatar:          '🎨',
    isOnline:        true,
    lastMessage:     'Traz as referências amanhã 👊',
    lastInteraction: new Date(Date.now() - 1000 * 60 * 5),   // 5 min atrás
    unreadCount:     2,
    messages: [
      {
        id:        'msg-1',
        role:      'contact',
        text:      'Oi João! Confirmando sua sessão pra amanhã às 14h 🎨',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      },
      {
        id:        'msg-2',
        role:      'user',
        text:      'Oi Rafael! Confirmado sim! Já tô animado demais 🔥',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        id:        'msg-3',
        role:      'contact',
        text:      'Traz as referências amanhã 👊',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
      },
    ],
  },
  {
    id:              '2',
    name:            'Marina Bones',
    avatar:          '🖋️',
    isOnline:        false,
    lastMessage:     'Pode confirmar o agendamento?',
    lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 2),  // 2h atrás
    unreadCount:     0,
    messages: [
      {
        id:        'msg-4',
        role:      'contact',
        text:      'Pode confirmar o agendamento?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    ],
  },
  {
    id:              '3',
    name:            'Tiago Dark Art',
    avatar:          '✏️',
    isOnline:        true,
    lastMessage:     'Projeto aprovado! Vejo você na sexta 🤙',
    lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 24), // ontem
    unreadCount:     0,
    messages: [
      {
        id:        'msg-5',
        role:      'contact',
        text:      'Projeto aprovado! Vejo você na sexta 🤙',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ],
  },
];

// ─── CONTEXT ──────────────────────────────────────────────────
const ConversationsContext = createContext(null);

// ─── PROVIDER ─────────────────────────────────────────────────
export function ConversationsProvider({ children }) {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);

  /** Adiciona mensagem do usuário e atualiza preview da lista */
  const sendMessage = useCallback((contactId, text) => {
    const newMsg = {
      id:        `msg-${Date.now()}`,
      role:      'user',
      text,
      timestamp: new Date(),
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === contactId
          ? {
              ...c,
              messages:        [...(c.messages ?? []), newMsg],
              lastMessage:     text,
              lastInteraction: new Date(),
              unreadCount:     0,
            }
          : c,
      ),
    );
  }, []);

  /** Adiciona resposta automática do contato */
  const receiveMessage = useCallback((contactId, text) => {
    const replyMsg = {
      id:        `msg-${Date.now() + 1}`,
      role:      'contact',
      text,
      timestamp: new Date(),
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === contactId
          ? {
              ...c,
              messages:        [...(c.messages ?? []), replyMsg],
              lastMessage:     text,
              lastInteraction: new Date(),
              unreadCount:     c.unreadCount + 1,
            }
          : c,
      ),
    );
  }, []);

  /** Zera contador de não lidas ao abrir a conversa */
  const markAsRead = useCallback((contactId) => {
    setConversations(prev =>
      prev.map(c =>
        c.id === contactId ? { ...c, unreadCount: 0 } : c,
      ),
    );
  }, []);

  /** Busca um contato pelo id */
  const getContact = useCallback(
    (contactId) => conversations.find(c => c.id === contactId) ?? null,
    [conversations],
  );

  return (
    <ConversationsContext.Provider
      value={{ conversations, sendMessage, receiveMessage, markAsRead, getContact }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────
export function useConversations() {
  const ctx = useContext(ConversationsContext);
  if (!ctx) {
    throw new Error('useConversations deve ser usado dentro de <ConversationsProvider>');
  }
  return ctx;
}