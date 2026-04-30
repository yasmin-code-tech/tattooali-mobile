import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius } from '../theme';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function MinhasDenunciasScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState('');

  const loadDenuncias = useCallback(async (isRefresh = false) => {
    if (!user?.user_id) return;

    if (!isRefresh) setLoading(true);
    setErro('');
    try {
      const response = await api.get(`/api/reports/all`); // Alterado para a nova rota dedicada
      setDenuncias(response?.success ? response.data : []);
    } catch (e) {
      setErro('Não foi possível carregar suas denúncias.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadDenuncias();
  }, [loadDenuncias]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDenuncias(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>
            {item.tipo_denunciado === 'user' ? 'TATUADOR' : 'CLIENTE'}
          </Text>
        </View>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString('pt-BR')} {/* Usando o novo nome do campo */}
        </Text>
      </View>
      
      <Text style={styles.targetName}>Denunciado: {item.denunciado}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {item.descricao}
      </Text>
      
      <View style={styles.footer}>
        <Ionicons name="time-outline" size={14} color={colors.text3} />
        <Text style={styles.statusText}>Em análise pela moderação</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={denuncias}
        keyExtractor={(item) => String(item.report_id)} // Usando o novo nome do campo
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.red} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color={colors.text3} />
              <Text style={styles.emptyText}>Você ainda não realizou denúncias.</Text>
            </View>
          )
        }
        ListHeaderComponent={
          loading && !refreshing ? <ActivityIndicator color={colors.red} style={{ marginTop: 20 }} /> : null
        }
      />
      {erro ? <Text style={styles.errorText}>{erro}</Text> : null}
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  listContent: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    backgroundColor: 'rgba(229,48,48,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: { color: colors.red, fontSize: 10, fontWeight: '700' },
  date: { color: colors.text3, fontSize: 12 },
  targetName: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 6 },
  description: { color: colors.text2, fontSize: 13, lineHeight: 18, marginBottom: 12 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  statusText: { color: colors.text3, fontSize: 12, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: colors.text3, marginTop: 12, fontSize: 14 },
  errorText: { color: colors.red, textAlign: 'center', marginBottom: 100 },
});