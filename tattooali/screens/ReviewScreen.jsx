import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.50.83.61:3000/api';

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

export default function ReviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { artist } = route.params;

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPastSessions();
  }, []);

  const fetchPastSessions = async () => {
    try {
      const token = await AsyncStorage.getItem('@tattoali:token');
      if (!token) {
        Alert.alert('Erro', 'Usuário não autenticado');
        return;
      }

      // Assumindo que o id do cliente é o user.id, mas talvez precise ajustar
      const user = JSON.parse(await AsyncStorage.getItem('@tattoali:user'));
      const clientId = user.id; // Ajustar se necessário

      const response = await fetch(`${API_BASE_URL}/sessions/${clientId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        // Filtrar sessões com o artista selecionado
        const artistSessions = data.filter(session => session.usuario_id === artist.id);
        setSessions(artistSessions);
      } else {
        Alert.alert('Erro', data.message || 'Erro ao buscar sessões');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!selectedSession) {
      Alert.alert('Erro', 'Selecione uma sessão para avaliar');
      return;
    }
    if (rating === 0) {
      Alert.alert('Erro', 'Selecione uma avaliação');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Erro', 'Digite um comentário');
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('@tattoali:token');
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          data_sessao: selectedSession.data_atendimento,
          nota: rating,
          comentario: comment,
          usuario_id: selectedSession.usuario_id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Sucesso', 'Avaliação enviada com sucesso!');
        navigation.goBack();
      } else {
        Alert.alert('Erro', data.error || 'Erro ao enviar avaliação');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão');
    } finally {
      setSubmitting(false);
    }
  };

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
        <Text style={styles.title}>Avaliar {artist.name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selecione a sessão</Text>
        {sessions.length === 0 ? (
          <Text style={styles.noSessions}>Nenhuma sessão encontrada com este artista.</Text>
        ) : (
          sessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={[
                styles.sessionItem,
                selectedSession?.id === session.id && styles.sessionSelected,
              ]}
              onPress={() => setSelectedSession(session)}
            >
              <Text style={styles.sessionDate}>
                {new Date(session.data_atendimento).toLocaleDateString('pt-BR')}
              </Text>
              <Text style={styles.sessionDesc}>{session.descricao}</Text>
            </TouchableOpacity>
          ))
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
            placeholder="Digite seu comentário..."
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
              <Text style={styles.submitBtnText}>Enviar Avaliação</Text>
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