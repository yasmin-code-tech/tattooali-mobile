import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import Navbar from '../components/Navbar';
import { colors } from '../theme';

export default function PrivacySecurityScreen() {
  const navigation = useNavigation();
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);

  function handleDeleteAccount() {
    setDeleteModalVisible(false);

    // 🔌 aqui você conecta com backend futuramente
    Alert.alert('Conta excluída', 'Sua conta foi removida com sucesso.');
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>Privacidade e Segurança</Text>

        {/* 🔐 SEGURANÇA */}
        <Text style={styles.sectionTitle}>SEGURANÇA DA CONTA</Text>

        <SettingItem
          icon="lock-closed"
          title="Alterar senha"
          description="Atualize sua senha para manter sua conta segura"
          onPress={() => navigation.navigate('RedefinirSenha')}
        />

        {/* 🚨 DENÚNCIAS */}
        <Text style={styles.sectionTitle}>DENÚNCIAS</Text>

        <SettingItem
          icon="alert-circle"
          title="Minhas denúncias"
          description="Visualize denúncias que você já realizou"
          onPress={() => navigation.navigate('MinhasDenuncias')}
        />

        {/* ⚠️ ZONA DE RISCO */}
        <Text style={styles.sectionTitle}>ZONA DE RISCO</Text>

        <TouchableOpacity
          style={styles.dangerItem}
          onPress={() => setDeleteModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash" size={18} color="#ef4444" />
          <Text style={styles.dangerText}>Excluir conta</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* 🔥 MODAL DE CONFIRMAÇÃO */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Excluir conta</Text>
            <Text style={styles.modalText}>
              Essa ação é irreversível. Todos os seus dados serão permanentemente removidos.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.deleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Navbar />
    </View>
  );
}

function SettingItem({ icon, title, description, onPress }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={18} color="#fff" />
      </View>

      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDesc}>{description}</Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color="#666" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    padding: 24,
    paddingBottom: 120,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text3,
    marginTop: 20,
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemLeft: {
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  itemDesc: {
    color: colors.text3,
    fontSize: 12,
    marginTop: 2,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  dangerText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 14,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalText: {
    color: colors.text3,
    fontSize: 13,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: colors.text3,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
  },
});