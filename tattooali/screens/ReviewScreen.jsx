import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme';
import { api } from '../lib/api';

const renderStars = (rating, onPress, interactive = false) => {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => interactive && onPress(star)}
          disabled={!interactive}
        >
          <Text style={[styles.star, rating >= star && styles.starFilled]}>
            {rating >= star ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

function sessionKey(s) {
  return s?.sessao_id ?? s?.id;
}

function matchesArtist(session, artistUserId) {
  if (artistUserId == null || !Number.isFinite(artistUserId)) return false;
  const uid =
    session?.usuario_id ??
    session?.usuario_Id ??
    session?.User?.user_id ??
    session?.user?.user_id;
  return Number(uid) === artistUserId;
}

export default function ReviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { artist } = route.params || {};
  const artistUserId = Number(artist?.user_id);
  const artistName = artist?.name || 'tatuador';

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchPastSessions = useCallback(async () => {
    if (!Number.isFinite(artistUserId) || artistUserId < 1) {
      setSessions([]);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get('/api/mobile/sessions/me/realizadas');
      const list = Array.isArray(data) ? data : [];
      const artistSessions = list.filter((s) => matchesArtist(s, artistUserId));
      setSessions(artistSessions);
    } catch (error) {
      const msg =
        error?.message ||
        error?.data?.message ||
        error?.data?.error ||
        'Erro ao buscar sessões';
      Alert.alert('Erro', String(msg));
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [artistUserId]);

  useEffect(() => {
    fetchPastSessions();
  }, [fetchPastSessions]);

  const submitReview = async () => {
    const sid = sessionKey(selectedSession);
    if (sid == null || !Number.isFinite(Number(sid))) {
      Alert.alert('Erro', 'Selecione uma sessão para avaliar');
      return;
    }
    if (rating === 0) {
      Alert.alert('Erro', 'Selecione uma nota de 1 a 5');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/reviews', {
        sessao_id: Number(sid),
        nota: rating,
        comentario: comment.trim() || '',
      });
      Alert.alert('Sucesso', 'Avaliação enviada com sucesso!');
      navigation.goBack();
    } catch (error) {
      const msg =
        error?.data?.error ||
        error?.data?.message ||
        error?.message ||
        'Erro ao enviar avaliação';
      Alert.alert('Erro', String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  if (!Number.isFinite(artistUserId) || artistUserId < 1) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.noSessions}>Não foi possível identificar o tatuador. Feche e abra de novo pelo perfil na busca.</Text>
        <TouchableOpacity style={styles.submitBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.submitBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.red} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Avaliar {artistName}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selecione a sessão</Text>
        {sessions.length === 0 ? (
          <Text style={styles.noSessions}>
            Nenhuma sessão concluída encontrada com este tatuador. As avaliações usam o mesmo CPF da sua conta e sessões já marcadas como realizadas na agenda.
          </Text>
        ) : (
          sessions.map((session) => {
            const key = sessionKey(session);
            const selectedKey = sessionKey(selectedSession);
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.sessionItem,
                  selectedKey === key && styles.sessionSelected,
                ]}
                onPress={() => setSelectedSession(session)}
              >
                <Text style={styles.sessionDate}>
                  {session.data_atendimento
                    ? new Date(session.data_atendimento).toLocaleDateString('pt-BR')
                    : '—'}
                </Text>
                <Text style={styles.sessionDesc}>{session.descricao || 'Sessão'}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {selectedSession && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sua avaliação</Text>

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Nota:</Text>
            {renderStars(rating, setRating, true)}
          </View>

          <TextInput
            style={styles.commentInput}
            placeholder="Comentário (opcional, até 500 caracteres)"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            maxLength={500}
          />

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={submitReview}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Enviar avaliação</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  centered: {
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  noSessions: {
    fontSize: 16,
    color: colors.text2,
    textAlign: 'center',
    lineHeight: 22,
  },
  sessionItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: colors.surface2,
  },
  sessionSelected: {
    borderColor: colors.red,
    backgroundColor: colors.surface3,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  sessionDesc: {
    fontSize: 14,
    color: colors.text2,
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 16,
    color: colors.text,
    marginRight: 16,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 24,
    color: colors.text3,
  },
  starFilled: {
    color: '#FFD700',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface2,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  submitBtn: {
    backgroundColor: colors.red,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
