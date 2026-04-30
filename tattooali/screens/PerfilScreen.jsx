import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function formatPhoneBR(digits) {
  const d = String(digits || '').replace(/\D/g, '');
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return d ? d : '—';
}

function formatDateDisplay(iso) {
  if (!iso) return '—';
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '—';
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function formatCpfChip(cpf) {
  const d = String(cpf || '').replace(/\D/g, '');
  if (d.length !== 11) return '—';
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

const SETTINGS_ITEMS = [
  { icon: 'calendar-outline',      color: '#3b82f6', label: 'Minha Agenda',            bg: 'rgba(59,130,246,0.1)',  route: 'Agenda', danger: false },
  { icon: 'chatbubble-outline',    color: '#22c55e', label: 'Mensagens',               bg: 'rgba(34,197,94,0.1)',   route: 'Contatos',   danger: false },
  { icon: 'star-outline',          color: '#f59e0b', label: 'Minhas Avaliações',       bg: 'rgba(245,158,11,0.1)',  route: 'MyReviews',     danger: false },
  { icon: 'notifications-outline', color: '#8b5cf6', label: 'Notificações',            bg: 'rgba(139,92,246,0.1)',  route: null,     danger: false },
  { icon: 'lock-closed-outline',   color: '#64748b', label: 'Privacidade e Segurança', bg: 'rgba(100,116,139,0.1)', route: 'PrivacySecurity',     danger: false },
  { icon: 'log-out-outline',       color: '#ef4444', label: 'Sair',                    bg: 'rgba(239,68,68,0.1)',   route: null,     danger: true, isLogout:true  },
];

export default function PerfilScreen({ route }) {
  const navigation = useNavigation();

  const { logout, user, refreshUser } = useAuth();

  useFocusEffect(
    useCallback(() => {
      refreshUser();
    }, [refreshUser]),
  );

  function handleItemPress(item) {
  if (item.isLogout) {
    logout();
    return;  // ← importante: interrompe aqui se for logout
  }

  if (item.route) navigation.navigate(item.route); // ← só chega aqui se NÃO for logout
}
  const profile = useMemo(() => {
    const cpfChip = formatCpfChip(user?.cpf);
    if (route?.params?.profile) {
      return { ...route.params.profile, cpf: cpfChip };
    }
    const name =
      [user?.nome, user?.sobrenome].filter(Boolean).join(' ').trim() ||
      user?.name ||
      'Usuário';
    const cidade =
      user?.cidade && String(user.cidade).trim() ? String(user.cidade).trim() : '—';
    const estado =
      user?.uf && String(user.uf).trim() ? String(user.uf).trim().toUpperCase() : '—';
    const styleChip =
      user?.estilo_favorito && String(user.estilo_favorito).trim()
        ? String(user.estilo_favorito).trim()
        : '—';
    return {
      name,
      email: user?.email || '—',
      phone: formatPhoneBR(user?.telefone),
      cpf: cpfChip,
      birth: formatDateDisplay(user?.data_nascimento),
      cidade,
      estado,
      style: styleChip,
      avatarIcon: 'person',
      avatarImg: null,
    };
  }, [route?.params?.profile, user]);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.clientHero}>
          <View style={styles.clientAvatar}>
            <Ionicons name={profile.avatarIcon} size={40} color={colors.text3} />
          </View>
          <Text style={styles.clientName}>{profile.name}</Text>
          <Text style={styles.clientEmail}>{profile.email}</Text>
          <View style={styles.infoChips}>
            <View style={styles.infoChip}>
              <Ionicons name="call-outline" size={13} color="#22c55e" />
              <Text style={styles.infoChipText}>{profile.phone}</Text>
            </View>
            <View style={styles.infoChip}>
              <Ionicons name="id-card-outline" size={13} color="#3b82f6" />
              <Text style={styles.infoChipText}>CPF {profile.cpf}</Text>
            </View>
            <View style={styles.infoChip}>
              <Ionicons name="location-outline" size={13} color={colors.red} />
              <Text style={styles.infoChipText}>{profile.cidade}, {profile.estado}</Text>
            </View>
            <View style={styles.infoChip}>
              <MaterialCommunityIcons name="cake-variant-outline" size={13} color="#8B4513" />
              <Text style={styles.infoChipText}>{profile.birth}</Text>
            </View>
            <View style={styles.infoChip}>
              <Ionicons name="color-palette-outline" size={13} color="#f59e0b" />
              <Text style={styles.infoChipText}>{profile.style}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => navigation.navigate('EditarPerfil', { profile })}
          >
            <Ionicons name="pencil-outline" size={14} color={colors.text} style={{ marginRight: 6 }} />
            <Text style={styles.btnOutlineText}>Editar perfil</Text>
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
                <Ionicons name={item.icon} size={20} color={item.color} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoChipText: {
    fontSize: 11,
    color: colors.text2,
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    marginTop: 6,
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
