import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from '../components/Navbar';

const API_BASE_URL = 'http://10.50.83.61:3000/api';

export default function AgendaScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('agendadas');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [agendadas, setAgendadas] = useState([]);
  const [concluidas, setConcluidas] = useState([]);
  const [canceladas, setCanceladas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastLoadedAt, setLastLoadedAt] = useState(null);

  function showNotice(message) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
      return;
    }
    Alert.alert('Aviso', message);
  }

  async function getAuthHeaders() {
    try {
      const token = await AsyncStorage.getItem('@tattooali:token');
      if (!token) return {};
      return {
        Authorization: `Bearer ${token}`,
      };
    } catch {
      return {};
    }
  }

  async function fetchSessions(endpoint, setter) {
    setLoading(true);
    setError(null);
    try {
      const headersAuth = await getAuthHeaders();
      const resp = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headersAuth,
        },
      });

      if (!resp.ok) {
        const msg = resp.status === 401
          ? 'Sessão expirada. Faça login novamente.'
          : `Não foi possível carregar agenda (${resp.status}).`;
        setError(msg);
        showNotice(msg);
        setter([]);
        return;
      }

      const data = await resp.json();
      setter(Array.isArray(data) ? data : []);
      setLastLoadedAt(new Date());
    } catch (e) {
      const msg = 'Não foi possível carregar agenda. Verifique sua conexão e tente novamente.';
      setError(msg);
      showNotice(msg);
      setter([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadByTab(tab) {
    if (tab === 'agendadas') {
      await fetchSessions('/sessions/pendentes', setAgendadas);
    } else if (tab === 'concluidas') {
      await fetchSessions('/sessions/realizadas', setConcluidas);
    } else if (tab === 'canceladas') {
      await fetchSessions('/sessions/canceladas', setCanceladas);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await handleLoadByTab(activeTab);
    setRefreshing(false);
  }

  async function handleCancelSession(sessionId) {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const headersAuth = await getAuthHeaders();
      const resp = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headersAuth,
        },
        body: JSON.stringify({ cancelado: true }),
      });

      if (!resp.ok) {
        const msg = 'Não foi possível cancelar a sessão.';
        setError(msg);
        showNotice(msg);
        return;
      }

      showNotice('Sessão cancelada com sucesso.');
      await handleLoadByTab('agendadas');
      await handleLoadByTab('canceladas');
    } catch {
      const msg = 'Não foi possível cancelar a sessão.';
      setError(msg);
      showNotice(msg);
    } finally {
      setLoading(false);
    }
  }

  function getEmptyMessage() {
    if (activeTab === 'agendadas') return 'Nenhum agendamento encontrado para este período.';
    if (activeTab === 'concluidas') return 'Nenhuma sessão concluída encontrada para este período.';
    return 'Nenhuma sessão cancelada encontrada para este período.';
  }

  function getCurrentList() {
    if (activeTab === 'agendadas') return agendadas;
    if (activeTab === 'concluidas') return concluidas;
    return canceladas;
  }

  useEffect(() => {
    handleLoadByTab(activeTab);
  }, [activeTab]);

  function handleSetRating(n) {
    setCurrentRating(n);
  }

  function handleSubmitRating() {
    if (currentRating === 0) return;
    setModalVisible(false);
    setCurrentRating(0);
    setComentario('');
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#e53030"
            colors={['#e53030']}
            progressBackgroundColor="#141414"
          />
        }
      >
        <View style={styles.agendaTabs}>
          <TouchableOpacity
            style={[styles.agendaTab, activeTab === 'agendadas' && styles.agendaTabActive]}
            onPress={() => setActiveTab('agendadas')}
          >
            <Text style={[styles.agendaTabText, activeTab === 'agendadas' && styles.agendaTabTextActive]}>
              Agendadas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.agendaTab, activeTab === 'concluidas' && styles.agendaTabActive]}
            onPress={() => setActiveTab('concluidas')}
          >
            <Text style={[styles.agendaTabText, activeTab === 'concluidas' && styles.agendaTabTextActive]}>
              Concluídas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.agendaTab, activeTab === 'canceladas' && styles.agendaTabActive]}
            onPress={() => setActiveTab('canceladas')}
          >
            <Text style={[styles.agendaTabText, activeTab === 'canceladas' && styles.agendaTabTextActive]}>
              Canceladas
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#e53030" />
          </View>
        )}

        {error && (
          <View style={styles.errorBoxInline}>
            <Text style={styles.errorTextInline}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => handleLoadByTab(activeTab)}>
              <Text style={styles.retryBtnText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && lastLoadedAt && (
          <Text style={styles.lastUpdateText}>
            Última atualização: {lastLoadedAt.toLocaleTimeString()}
          </Text>
        )}

        {!loading && !error && getCurrentList().length === 0 && (
          <View style={styles.emptyStateBox}>
            <Text style={styles.emptyStateTitle}>Agenda vazia</Text>
            <Text style={styles.emptyStateText}>{getEmptyMessage()}</Text>
          </View>
        )}

        {activeTab === 'agendadas' && (
          <View style={styles.sessionList}>
            {agendadas.length === 0 && !loading ? (
              <Text style={styles.emptyText} />
            ) : (
              agendadas.map(sessao => (
                <View key={sessao.sessao_id || sessao.id} style={styles.sessionCard}>
                  <View style={styles.sessionCardHeader}>
                    <View style={styles.sessionAvatar}>
                      <Text style={styles.sessionAvatarEmoji}>🎨</Text>
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionName}>{sessao.cliente?.nome ?? 'Cliente'}</Text>
                      <Text style={styles.sessionDate}>
                        {sessao.data_atendimento
                          ? new Date(sessao.data_atendimento).toLocaleString()
                          : ''}
                      </Text>
                    </View>
                    <View style={[styles.sessionStatus, styles.statusAgendada]}>
                      <Text style={[styles.sessionStatusText, { color: '#60a5fa' }]}>Agendada</Text>
                    </View>
                  </View>
                  <Text style={styles.sessionDesc}>{sessao.descricao ?? ''}</Text>
                  <View style={styles.sessionFooter}>
                    <TouchableOpacity
                      style={styles.btnOutlineSm}
                      onPress={() => navigation.navigate('Chat')}
                    >
                      <Text style={styles.btnOutlineSmText}>💬 Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnOutlineSm, styles.btnDanger]}
                      onPress={() => handleCancelSession(sessao.sessao_id || sessao.id)}
                    >
                      <Text style={[styles.btnOutlineSmText, { color: '#f87171' }]}>✕ Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'concluidas' && (
          <View style={styles.sessionList}>
            {concluidas.length === 0 && !loading ? (
              <Text style={styles.emptyText} />
            ) : (
              concluidas.map(sessao => (
                <View key={sessao.sessao_id || sessao.id} style={styles.sessionCard}>
                  <View style={styles.sessionCardHeader}>
                    <View style={styles.sessionAvatar}>
                      <Text style={styles.sessionAvatarEmoji}>🖋️</Text>
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionName}>{sessao.cliente?.nome ?? 'Cliente'}</Text>
                      <Text style={styles.sessionDate}>
                        {sessao.data_atendimento
                          ? new Date(sessao.data_atendimento).toLocaleString()
                          : ''}
                      </Text>
                    </View>
                    <View style={[styles.sessionStatus, styles.statusConcluida]}>
                      <Text style={[styles.sessionStatusText, { color: '#4ade80' }]}>Concluída</Text>
                    </View>
                  </View>
                  <Text style={styles.sessionDesc}>{sessao.descricao ?? ''}</Text>
                  <View style={styles.sessionFooter}>
                    <TouchableOpacity
                      style={styles.btnOutlineSm}
                      onPress={() => navigation.navigate('Chat')}
                    >
                      <Text style={styles.btnOutlineSmText}>💬 Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnPrimarySm}
                      onPress={() => setModalVisible(true)}
                    >
                      <Text style={styles.btnPrimarySmText}>⭐ Avaliar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'canceladas' && (
          <View style={styles.sessionList}>
            {canceladas.length === 0 && !loading ? (
              <Text style={styles.emptyText} />
            ) : (
              canceladas.map(sessao => (
                <View key={sessao.sessao_id || sessao.id} style={styles.sessionCard}>
                  <View style={styles.sessionCardHeader}>
                    <View style={styles.sessionAvatar}>
                      <Text style={styles.sessionAvatarEmoji}>🎨</Text>
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionName}>{sessao.cliente?.nome ?? 'Cliente'}</Text>
                      <Text style={styles.sessionDate}>
                        {sessao.data_atendimento
                          ? new Date(sessao.data_atendimento).toLocaleString()
                          : ''}
                      </Text>
                    </View>
                    <View style={[styles.sessionStatus, styles.statusCancelada]}>
                      <Text style={[styles.sessionStatusText, { color: '#f87171' }]}>Cancelada</Text>
                    </View>
                  </View>
                  <Text style={styles.sessionDesc}>{sessao.descricao ?? ''}</Text>
                  <View style={styles.sessionFooter}>
                    <TouchableOpacity
                      style={styles.btnOutlineSm}
                      onPress={() => navigation.navigate('PerfilTatuador')}
                    >
                      <Text style={styles.btnOutlineSmText}>Reagendar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <Navbar />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity style={styles.modalSheet} activeOpacity={1}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>AVALIAR SESSÃO</Text>
            <Text style={styles.modalSubtitle}>
              Como foi sua experiência com{' '}
              <Text style={{ color: '#e53030' }}>Marina Bones</Text>?
            </Text>
            <View style={styles.starRating}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} onPress={() => handleSetRating(n)}>
                  <Text style={[styles.star, n <= currentRating ? styles.starSelected : styles.starEmpty]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>COMENTÁRIO (OPCIONAL)</Text>
              <TextInput
                style={styles.textarea}
                placeholder="Conte como foi sua experiência..."
                placeholderTextColor="#555"
                multiline
                numberOfLines={4}
                value={comentario}
                onChangeText={setComentario}
              />
            </View>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmitRating}>
              <Text style={styles.btnPrimaryText}>Enviar Avaliação</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnOutline, { marginTop: 8 }]} onPress={() => setModalVisible(false)}>
              <Text style={styles.btnOutlineText}>Cancelar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  agendaTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  agendaTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  agendaTabActive: {
    borderBottomColor: '#e53030',
  },
  agendaTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    letterSpacing: 0.5,
  },
  agendaTabTextActive: {
    color: '#e53030',
  },
  sessionList: {
    padding: 16,
    gap: 12,
  },
  lastUpdateText: {
    color: '#777',
    fontSize: 11,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyStateBox: {
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  emptyStateTitle: {
    color: '#f0f0f0',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyStateText: {
    color: '#9a9a9a',
    fontSize: 12,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#f87171',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  retryBtnText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '600',
  },
  errorBoxInline: {
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.5)',
    backgroundColor: 'rgba(127,29,29,0.22)',
    borderRadius: 12,
    padding: 12,
  },
  errorTextInline: {
    color: '#fca5a5',
    fontSize: 12,
  },
  sessionCard: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  sessionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#242424',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionAvatarEmoji: {
    fontSize: 20,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f0f0f0',
  },
  sessionDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  sessionStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sessionStatusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statusAgendada: {
    backgroundColor: 'rgba(59,130,246,0.15)',
  },
  statusConcluida: {
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  statusCancelada: {
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  sessionDesc: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  sessionFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  btnOutlineSm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: 'transparent',
  },
  btnOutlineSmText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f0f0f0',
  },
  btnDanger: {
    borderColor: '#f87171',
  },
  btnPrimarySm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e53030',
    shadowColor: '#e53030',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimarySmText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  avaliadaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: 8,
  },
  avaliadaBadgeText: {
    color: '#4ade80',
    fontSize: 11,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#f0f0f0',
    marginBottom: 6,
  },
  modalSubtitle: {
    color: '#888',
    fontSize: 13,
    marginBottom: 24,
  },
  starRating: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  star: {
    fontSize: 36,
  },
  starSelected: {
    color: '#fbbf24',
  },
  starEmpty: {
    color: '#2a2a2a',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  textarea: {
    backgroundColor: '#1c1c1c',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#f0f0f0',
    fontSize: 14,
    height: 90,
    textAlignVertical: 'top',
  },
  btnPrimary: {
    backgroundColor: '#e53030',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#e53030',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  btnOutline: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: 'transparent',
  },
  btnOutlineText: {
    color: '#f0f0f0',
    fontSize: 15,
    fontWeight: '600',
  },
});
