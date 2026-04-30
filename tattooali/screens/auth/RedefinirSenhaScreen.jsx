import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, radius } from '../../theme';
import { api } from '../../lib/api';

export default function RedefinirSenhaScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // O access_token é extraído dos parâmetros da rota injetados pelo Linking no App.js
  // Graças ao getStateFromPath que configuramos, o fragmento '#' virou query param.
  const { access_token } = route.params || {};

  // Verifica se o token existe assim que a tela monta
  useEffect(() => {
    if (!access_token) {
      Alert.alert(
        'Acesso Inválido',
        'Esta tela só pode ser acessada através do link enviado para o seu e-mail.',
        [{ text: 'Voltar ao Login', onPress: () => navigation.navigate('Login') }]
      );
      // Redireciona preventivamente caso o alert não bloqueie a interação
      navigation.navigate('Login');
    }
  }, [access_token, navigation]);

  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const [senhaFocused, setSenhaFocused] = useState(false);
  const [confirmarFocused, setConfirmarFocused] = useState(false);

  async function handleRedefinir() {
    if (!access_token) {
      setErro('Token de recuperação expirado ou inválido. Tente solicitar um novo e-mail.');
      return;
    }

    if (senha.length < 8) {
      setErro('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setErro('');
    setLoading(true);

    try {
      // Chamada para o backend enviando o token do Supabase e a nova senha
      // Note que passamos o access_token como 'token' para bater com o seu userController
      await api.post('/api/user/alterar-senha', {
        token: access_token,
        novaSenha: senha,
      });

      Alert.alert(
        'Sucesso',
        'Sua senha foi redefinida com sucesso!',
        [{ text: 'Fazer Login', onPress: () => navigation.navigate('Login') }]
      );
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Não foi possível redefinir a senha.';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{'NOVA\nSENHA'}</Text>
          <Text style={styles.subtitle}>Crie uma senha forte para sua segurança.</Text>
        </View>

        {erro !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>NOVA SENHA</Text>
          <TextInput
            style={[styles.input, senhaFocused && styles.inputFocused]}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor={colors.text3}
            secureTextEntry
            value={senha}
            onChangeText={(v) => { setSenha(v); setErro(''); }}
            onFocus={() => setSenhaFocused(true)}
            onBlur={() => setSenhaFocused(false)}
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>CONFIRMAR SENHA</Text>
          <TextInput
            style={[styles.input, confirmarFocused && styles.inputFocused]}
            placeholder="Repita a nova senha"
            placeholderTextColor={colors.text3}
            secureTextEntry
            value={confirmarSenha}
            onChangeText={(v) => { setConfirmarSenha(v); setErro(''); }}
            onFocus={() => setConfirmarFocused(true)}
            onBlur={() => setConfirmarFocused(false)}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnPrimaryDisabled]}
          activeOpacity={0.85}
          onPress={handleRedefinir}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnPrimaryText}>Atualizar Senha</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginLinkWrap} 
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
        >
          <Text style={styles.loginLink}>Cancelar e voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 80, paddingBottom: 40 },
  header: { marginBottom: 32 },
  title: { fontSize: 36, letterSpacing: 2, color: colors.text, lineHeight: 38, fontWeight: '700' },
  subtitle: { color: colors.text2, fontSize: 13, marginTop: 8 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '600', color: colors.text3, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  input: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 16, paddingVertical: 14, color: colors.text, fontSize: 14 },
  inputFocused: { borderColor: colors.red },
  errorBox: { backgroundColor: 'rgba(229,48,48,0.1)', borderWidth: 1, borderColor: 'rgba(229,48,48,0.3)', borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 },
  errorText: { color: '#f87171', fontSize: 13, textAlign: 'center' },
  btnPrimary: { backgroundColor: colors.red, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: colors.red, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  btnPrimaryDisabled: { opacity: 0.65 },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
  loginLinkWrap: { alignItems: 'center', marginTop: 24 },
  loginLink: { color: colors.text2, fontSize: 13 },
});