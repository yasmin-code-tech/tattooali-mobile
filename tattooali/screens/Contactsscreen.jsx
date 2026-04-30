import React, { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

import { C } from '../styles/token';
import { formatListTime } from '../utils/timeUtils';
import { useConversations } from '../context/ConversationsContext';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/Navbar';


// ─── CONTACT ITEM ─────────────────────────────────────────────
const ContactItem = React.memo(({ item, onPress }) => {
  const hasUnread = item.unreadCount > 0;

  return (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <Text style={styles.avatarEmoji}>{item.avatar}</Text>
        {item.isOnline && <View style={styles.onlineDot} />}
      </View>

      {/* Text info */}
      <View style={styles.contactBody}>
        <Text style={[styles.contactName, hasUnread && styles.contactNameUnread]}>
          {item.name}
        </Text>
        <Text
          style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.lastMessage}
        </Text>
      </View>

      {/* Meta (time + badge) */}
      <View style={styles.contactMeta}>
        <Text style={[styles.timeLabel, hasUnread && styles.timeLabelUnread]}>
          {formatListTime(item.lastInteraction)}
        </Text>
        {hasUnread ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unreadCount}</Text>
          </View>
        ) : (
          <View style={styles.badgePlaceholder} />
        )}
      </View>
    </TouchableOpacity>
  );
});

// ─── SEPARATOR ────────────────────────────────────────────────
const Separator = () => <View style={styles.separator} />;

// ─── CONTACTS SCREEN ──────────────────────────────────────────
export default function ContactsScreen({ navigation }) {
  const { user } = useAuth();
  const { conversations, refreshThreads, markAsRead, error, isSupabaseReady, loading } = useConversations();

  useFocusEffect(
    useCallback(() => {
      markAsRead();
      refreshThreads();
    }, [markAsRead, refreshThreads]),
  );

  // Ordena por mais recente
  const sorted = [...conversations].sort(
    (a, b) => new Date(b.lastInteraction) - new Date(a.lastInteraction),
  );

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);

  const handlePress = useCallback(
    (contact) => {
      navigation.navigate('Chat', {
        peerAppUserId: contact.peerAppUserId,
        peerName: contact.name,
        peerAvatar: null,
      });
    },
    [navigation],
  );

  return (
    <AppLayout>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.ink} />

      {/* ── HEADER ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Mensagens</Text>
          <Text style={styles.headerSub}>
            {user?.role === 'tatuador' ? 'Converse com seus clientes' : 'Converse com seus tatuadores'}
          </Text>
        </View>
        {totalUnread > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{totalUnread}</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {error ? (
        <Text style={{ color: '#f87171', paddingHorizontal: 20, paddingVertical: 8, fontSize: 13 }}>
          {error}
        </Text>
      ) : null}

      {/* ── LIST ───────────────────────────────────────────── */}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContactItem item={item} onPress={handlePress} />
        )}
        ItemSeparatorComponent={Separator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyText}>
              {!isSupabaseReady
                ? 'Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY'
                : loading
                  ? 'Carregando…'
                  : 'Nenhuma conversa ainda'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
    </AppLayout>
  );
}

// ─── STYLES ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.ink,
  },

  // ── Header ──────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: C.white,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  headerSub: {
    color: C.smoke,
    fontSize: 13,
  },
  headerBadge: {
    backgroundColor: C.red,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: {
    color: C.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Divider ─────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: C.ink3,
  },

  // ── List ────────────────────────────────────────────────────
  listContent: {
    flexGrow: 1,
  },

  // ── Contact item ────────────────────────────────────────────
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },

  // ── Avatar ──────────────────────────────────────────────────
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: C.ink3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.green,
    borderWidth: 2,
    borderColor: C.ink,
  },

  // ── Body ────────────────────────────────────────────────────
  contactBody: {
    flex: 1,
    minWidth: 0,
  },
  contactName: {
    color: C.ash,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  contactNameUnread: {
    color: C.white,
  },
  lastMessage: {
    color: C.smoke,
    fontSize: 12,
  },
  lastMessageUnread: {
    color: C.ash,
    fontWeight: '500',
  },

  // ── Meta ────────────────────────────────────────────────────
  contactMeta: {
    alignItems: 'flex-end',
    gap: 5,
    flexShrink: 0,
  },
  timeLabel: {
    color: C.mist,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  timeLabelUnread: {
    color: C.red,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: C.red,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: C.white,
    fontSize: 10,
    fontWeight: '700',
  },
  badgePlaceholder: {
    height: 18,
  },

  // ── Separator ───────────────────────────────────────────────
  separator: {
    height: 1,
    backgroundColor: C.ink3,
    marginLeft: 86,
  },

  // ── Empty state ─────────────────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    color: C.smoke,
    fontSize: 14,
  },
});