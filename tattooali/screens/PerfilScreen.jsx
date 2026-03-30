import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const SETTINGS_ITEMS = [
  { emoji: '📅', label: 'Minha Agenda',            bg: 'rgba(59,130,246,0.1)',  route: 'Agenda', danger: false },
  { emoji: '💬', label: 'Mensagens',               bg: 'rgba(34,197,94,0.1)',   route: 'Chat',   danger: false },
  { emoji: '⭐', label: 'Minhas Avaliações',        bg: 'rgba(245,158,11,0.1)', route: null,     danger: false },
  { emoji: '🔔', label: 'Notificações',            bg: 'rgba(139,92,246,0.1)', route: null,     danger: false },
  { emoji: '🔒', label: 'Privacidade e Segurança', bg: 'rgba(100,116,139,0.1)',route: null,     danger: false },
  { emoji: '🚪', label: 'Sair',                    bg: 'rgba(239,68,68,0.1)',  route: null,  danger: true, isLogout:true  },
];

export default function PerfilScreen({ route }) {
  const navigation = useNavigation();

  const { logout } = useAuth();
  
  function handleItemPress(item) {
  if (item.isLogout) {
    logout();
    return;  // ← importante: interrompe aqui se for logout
  }

  if (item.route) navigation.navigate(item.route); // ← só chega aqui se NÃO for logout
}
  const profile = route?.params?.profile ?? {
    name:        'João Pedro Lima',
    email:       'joao@email.com',
    phone:       '(11) 99999-0000',
    birth:       '12/05/1995',
    cidade:      'São Paulo',
    estado:      'SP',
    style:       'Realismo',
    avatarEmoji: '👤',
    avatarImg:   null,
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.clientHero}>
          <View style={styles.clientAvatar}>
            <Text style={styles.clientAvatarEmoji}>{profile.avatarEmoji}</Text>
          </View>
          <Text style={styles.clientName}>{profile.name}</Text>
          <Text style={styles.clientEmail}>{profile.email}</Text>
          <View style={styles.infoChips}>
            <View style={styles.infoChip}><Text style={styles.infoChipText}>📱 {profile.phone}</Text></View>
            <View style={styles.infoChip}><Text style={styles.infoChipText}>📍 {profile.cidade}, {profile.estado}</Text></View>
            <View style={styles.infoChip}><Text style={styles.infoChipText}>🎂 {profile.birth}</Text></View>
            <View style={styles.infoChip}><Text style={styles.infoChipText}>🎨 {profile.style}</Text></View>
          </View>
          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => navigation.navigate('EditarPerfil', { profile })}
          >
            <Text style={styles.btnOutlineText}>✏️ Editar perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsList}>
          {SETTINGS_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.settingsItem, i === SETTINGS_ITEMS.length - 1 && styles.settingsItemLast]}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.75}
            >
              <View style={[styles.settingsIcon, { backgroundColor: item.bg }]}>
                <Text style={styles.settingsIconEmoji}>{item.emoji}</Text>
              </View>
              <Text style={[styles.settingsLabel, item.danger && styles.settingsLabelDanger]}>
                {item.label}
              </Text>
              <Text style={[styles.chevron, item.danger && { color: '#f87171' }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Navbar/>
    </View>
  );
}

const colors = {
  bg:       '#0a0a0a',
  surface:  '#141414',
  surface2: '#1c1c1c',
  border:   '#2a2a2a',
  red:      '#e53030',
  text:     '#f0f0f0',
  text2:    '#888888',
  text3:    '#555555',
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  clientHero: {
    paddingHorizontal: 24,
    paddingVertical: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  clientAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface2,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientAvatarEmoji: {
    fontSize: 40,
  },
  clientName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.text,
  },
  clientEmail: {
    fontSize: 13,
    color: colors.text2,
  },
  infoChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    justifyContent: 'center',
    marginTop: 2,
  },
  infoChip: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },
  infoChipText: {
    fontSize: 11,
    color: colors.text2,
  },
  btnOutline: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    marginTop: 2,
  },
  btnOutlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  settingsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsItemLast: {
    borderBottomWidth: 0,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  settingsIconEmoji: {
    fontSize: 18,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  settingsLabelDanger: {
    color: '#f87171',
  },
  chevron: {
    color: colors.text3,
    fontSize: 18,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 80,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 16,
    zIndex: 20,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  navIcon: {
    fontSize: 22,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: colors.text3,
    letterSpacing: 0.5,
  },
  navLabelActive: {
    color: colors.red,
  },
});
