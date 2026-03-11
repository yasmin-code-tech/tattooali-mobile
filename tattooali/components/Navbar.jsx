import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { label: 'BUSCAR', icon: '🔍', route: 'Busca'        },
  { label: 'AGENDA', icon: '📅', route: 'Agenda'       },
  { label: 'CHAT',   icon: '💬', route: 'Chat'         },
  { label: 'PERFIL', icon: '👤', route: 'PerfilCliente' },
];

export default function AppLayout({ children }) {
  const navigation = useNavigation();
  const route      = useRoute();
  const { logout } = useAuth();

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
              <Text style={styles.navIcon}>{item.icon}</Text>
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
          <Text style={styles.navIcon}>🚪</Text>
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
  },
  navItemActive: {},
  navIcon: {
    fontSize: 22,
  },
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