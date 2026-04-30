import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Navbar from '../components/Navbar';
import { useNotifications } from '../context/NotificationsContext';

function formatWhen(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function iconByType(type) {
  if (type === 'SESSION_CREATED') return 'calendar-outline';
  if (type === 'SESSION_CANCELED') return 'close-circle-outline';
  if (type === 'REVIEW_AVAILABLE') return 'star-outline';
  return 'notifications-outline';
}

export default function NotificationsScreen() {
  const {
    notifications,
    loading,
    error,
    refreshNotifications,
    markAllAsRead,
    markOneAsRead,
  } = useNotifications();

  useFocusEffect(
    useCallback(() => {
      refreshNotifications();
    }, [refreshNotifications]),
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshNotifications}
            tintColor="#e53030"
          />
        }
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>CENTRAL DE NOTIFICACOES</Text>
            <TouchableOpacity style={styles.markAllBtn} onPress={markAllAsRead} activeOpacity={0.8}>
              <Ionicons name="checkmark-done-outline" size={14} color="#d4d4d4" />
              <Text style={styles.markAllText}>Marcar todas</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={34} color="#666" />
            <Text style={styles.emptyTitle}>Nenhuma notificacao por enquanto</Text>
            <Text style={styles.emptySub}>
              Quando houver sessoes marcadas, canceladas ou avaliacao disponivel, elas aparecerao aqui.
            </Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => markOneAsRead(item.id)}
            activeOpacity={0.82}
            style={[styles.card, item.isRead && styles.cardRead]}
          >
            <View style={[styles.iconWrap, item.isRead && styles.iconWrapRead]}>
              <Ionicons name={iconByType(item.type)} size={18} color={item.isRead ? '#737373' : '#f0f0f0'} />
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Text style={[styles.cardTitle, item.isRead && styles.cardTitleRead]}>{item.title}</Text>
                <Text style={styles.when}>{formatWhen(item.createdAt)}</Text>
              </View>
              {item.message ? (
                <Text style={[styles.cardText, item.isRead && styles.cardTextRead]}>{item.message}</Text>
              ) : null}
            </View>
            {!item.isRead ? <View style={styles.unreadDot} /> : null}
          </TouchableOpacity>
        )}
      />
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100, gap: 10 },
  headerRow: {
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#f0f0f0', fontWeight: '800', letterSpacing: 0.6, fontSize: 16 },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#121212',
  },
  markAllText: { color: '#d4d4d4', fontSize: 12, fontWeight: '600' },
  card: {
    borderWidth: 1,
    borderColor: '#2f2f2f',
    borderRadius: 14,
    backgroundColor: '#151515',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  cardRead: { backgroundColor: '#111111', borderColor: '#222' },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0e0e0e',
  },
  iconWrapRead: { borderColor: '#2f2f2f' },
  cardBody: { flex: 1, gap: 4 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  cardTitle: { color: '#f0f0f0', fontWeight: '700', flexShrink: 1 },
  cardTitleRead: { color: '#a3a3a3' },
  cardText: { color: '#cfcfcf', fontSize: 13, lineHeight: 18 },
  cardTextRead: { color: '#8e8e8e' },
  when: { color: '#7a7a7a', fontSize: 11, marginTop: 1 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e53030',
    marginTop: 5,
  },
  emptyState: { paddingTop: 44, alignItems: 'center', gap: 8, paddingHorizontal: 14 },
  emptyTitle: { color: '#d4d4d4', fontWeight: '700', fontSize: 16, textAlign: 'center' },
  emptySub: { color: '#8a8a8a', textAlign: 'center', fontSize: 13, lineHeight: 18 },
  errorText: { color: '#f87171', textAlign: 'center', marginTop: 4, fontSize: 12 },
});
