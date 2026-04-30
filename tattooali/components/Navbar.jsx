import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useConversations } from '../context/ConversationsContext';

const NAV_ITEMS = [
  { label: 'BUSCAR', icon: 'search',          iconActive: 'search',           route: 'Busca'        },
  { label: 'AGENDA', icon: 'calendar-outline', iconActive: 'calendar',         route: 'Agenda'       },
  // 👇 A ALTERAÇÃO FOI FEITA AQUI: route mudou para 'Contatos'
  { label: 'CHAT',   icon: 'chatbubble-outline',iconActive: 'chatbubble',      route: 'Contatos'     },
  { label: 'PERFIL', icon: 'person-outline',   iconActive: 'person',           route: 'Perfil' },
];

export default function AppLayout({ children }) {
  const navigation = useNavigation();
  const route      = useRoute();
  const { logout } = useAuth();
  const { totalUnreadCount } = useConversations();

  function handleLogout() {
    logout();
  }

  return (
    <View style={styles.root}>
      <View style={styles.content}>{children}</View>

      <View style={styles.bottomNav}>
        {NAV_ITEMS.map(item => {
          const active = route.name === item.route;
          return (
            <TouchableOpacity
              key={item.label}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={active ? item.iconActive : item.icon}
                size={22}
                color={active ? '#e53030' : '#555'}
              />
              {item.route === 'Contatos' && totalUnreadCount > 0 ? (
                <View style={styles.chatUnreadDot} />
              ) : null}
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Logout */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <Ionicons name="log-out-outline" size={22} color="#f87171" />
          <Text style={[styles.navLabel, styles.navLabelLogout]}>SAIR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    paddingBottom: 80,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#141414',
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 16,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    position: 'relative',
  },
  chatUnreadDot: {
    position: 'absolute',
    top: 7,
    right: 14,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#e53030',
    borderWidth: 1,
    borderColor: '#141414',
  },
  navItemActive: {},
  navLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: '#555',
    letterSpacing: 0.5,
  },
  navLabelActive: {
    color: '#e53030',
  },
  navLabelLogout: {
    color: '#f87171',
  },
});