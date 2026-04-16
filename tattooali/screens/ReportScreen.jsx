import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const C = {
  bg:          '#0c0c0e',
  surface:     '#161618',
  surface2:    '#222226',
  border:      '#303036',
  red:         '#e8281e',
  smoke:       '#7a7a88',
  white:       '#ffffff',
  error:       '#f87171',
};

const DESC_MAX = 500;

export default function ReportScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  /**
   * Os parâmetros devem vir da tela anterior (ex: Perfil do Tatuador ou Cliente)
   * denunciadoId: ID do banco
   * denunciadoNome: Nome de exibição
   * tipoDenunciado: 'user' (tatuador) ou 'client' (cliente)
   */
  const { denunciadoId, denunciadoNome, tipoDenunciado } = route.params || {};

  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Validar se os dados necessários chegaram via navegação
  useEffect(() => {
    if (!denunciadoId || !tipoDenunciado) {
      Alert.alert("Erro", "Informações do denunciado não encontradas.");
      navigation.goBack();
    }
  }, [denunciadoId, tipoDenunciado]);

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (descricao.trim().length < 10) {
      setError('Descreva a ocorrência com pelo menos 10 caracteres.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await AsyncStorage.getItem('@TattooAli:token');

      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          descricao: descricao.trim(),
          denunciadoId: denunciadoId,
          tipoDenunciado: tipoDenunciado, // 'user' ou 'client'
          denunciadoNome: denunciadoNome
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSent(true);
        setTimeout(() => navigation.goBack(), 2000);
      } else {
        Alert.alert("Não foi possível enviar", data.message || "Erro desconhecido.");
      }
    } catch (err) {
      console.error('[ReportScreen] Erro:', err);
      Alert.alert("Erro de conexão", "Verifique se o servidor está online.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView
        style={styles.kavWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={C.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Registrar Denúncia</Text>
            <Text style={styles.headerSub}>Denunciando: {denunciadoNome}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {sent ? (
          <View style={styles.successWrap}>
            <Ionicons name="checkmark-circle" size={80} color="#4ade80" />
            <Text style={styles.successTitle}>Denúncia enviada!</Text>
            <Text style={styles.successSub}>Nossa equipe irá analisar o ocorrido.</Text>
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>DESCRIÇÃO DA OCORRÊNCIA</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline, !!error && styles.inputError]}
              value={descricao}
              onChangeText={(v) => {
                setDescricao(v);
                if (error) setError('');
              }}
              placeholder="Explique detalhadamente o que aconteceu..."
              placeholderTextColor={C.smoke}
              multiline
              maxLength={DESC_MAX}
              textAlignVertical="top"
            />
            <View style={styles.infoRow}>
              {!!error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <View /> 
              )}
              <Text style={[styles.charCount, descricao.length >= DESC_MAX && { color: C.red }]}>
                {descricao.length}/{DESC_MAX}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (descricao.length < 10 || loading) && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading || descricao.length < 10}
            >
              {loading ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <Text style={styles.submitBtnText}>Enviar denúncia</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  kavWrap: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, backgroundColor: C.surface },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  headerTitle: { color: C.white, fontSize: 18, fontWeight: '800' },
  headerSub: { color: C.smoke, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: C.border },
  scrollContent: { padding: 24 },
  label: { fontSize: 10, fontWeight: '600', color: C.smoke, marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, color: C.white, fontSize: 14 },
  inputMultiline: { minHeight: 150, paddingTop: 14 },
  inputError: { borderColor: C.red },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  errorText: { color: C.error, fontSize: 12 },
  charCount: { color: C.smoke, fontSize: 11 },
  submitBtn: { height: 55, borderRadius: 14, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  btnDisabled: { backgroundColor: C.mist, opacity: 0.6 },
  submitBtnText: { color: C.white, fontSize: 16, fontWeight: '700' },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successTitle: { color: C.white, fontSize: 22, fontWeight: '800', marginTop: 16 },
  successSub: { color: C.smoke, textAlign: 'center', marginTop: 8 },
});