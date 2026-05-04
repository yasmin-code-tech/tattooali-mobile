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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, radius } from '../../theme';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function RedefinirSenhaScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { isAuthenticated } = useAuth();

  // O access_token é extraído dos parâmetros da rota injetados pelo Linking no App.js
  // Graças ao getStateFromPath que configuramos, o fragmento '#' virou query param.
  const { access_token } = route.params || {};

  const [validandoToken, setValidandoToken] = useState(!!access_token && !isAuthenticated);

  // Verifica se o token existe assim que a tela monta
  useEffect(() => {
    async function verificarToken() {
      // Se não estiver logado e houver um token, precisamos validar com o servidor
      if (!isAuthenticated && access_token) {
        try {
          await api.post('/api/user/validar-token', { token: access_token });
          setValidandoToken(false);
        } catch (e) {
          Alert.alert(
            'Link Expirado',
            'Este link de recuperação não é mais válido ou já foi utilizado. Tente solicitar um novo e-mail.',
            [{ text: 'Ir para Login', onPress: () => navigation.navigate('Login') }]
          );
        }
      } 
      // Se não estiver logado E não houver token, o acesso é inválido direto
      else if (!isAuthenticated && !access_token) {
        Alert.alert(
          'Acesso Inválido',
          'Para alterar sua senha, você deve estar logado ou acessar o link enviado para o seu e-mail.',
          [{ text: 'Voltar ao Login', onPress: () => navigation.navigate('Login') }]
        );
      }
    }
    verificarToken();
  }, [access_token, isAuthenticated]);

  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [senhaFocused, setSenhaFocused] = useState(false);
  const [confirmarFocused, setConfirmarFocused] = useState(false);

  // Verifica em tempo real se as senhas são diferentes (apenas se o segundo campo não estiver vazio)
  const senhasDiferentes = confirmarSenha.length > 0 && senha !== confirmarSenha;

  async function handleRedefinir() {
    // Se não tem token e não está logado, não podemos prosseguir
    setSucesso('');
    if (!access_token && !isAuthenticated) {
      setErro('Sessão expirada ou token inválido. Tente fazer login ou solicitar um novo e-mail.');
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
      const payload = { novaSenha: senha };
      
      // Se houver um token (fluxo externo), enviamos no corpo. 
      // Se estiver logado (fluxo interno), o middleware do backend usará o token da sessão no header.
      if (access_token) {
        payload.token = access_token;
      }

      await api.post('/api/user/alterar-senha', payload);
      setSucesso('Sua senha foi redefinida com sucesso!');

      Alert.alert(
        'Sucesso',
        'Sua senha foi redefinida com sucesso!',
        [{ 
          text: isAuthenticated ? 'OK' : 'Fazer Login', 
          onPress: () => isAuthenticated ? navigation.goBack() : navigation.navigate('Login') 
        }]
      );
    } catch (e) {
      // Captura a mensagem de erro vinda do seu backend
      const msg = e?.data?.error || e?.data?.message || e?.message || 'Não foi possível redefinir a senha.';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    isAuthenticated ? navigation.goBack() : navigation.navigate('Login');
  }

  if (validandoToken) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.red} />
        <Text style={{ color: colors.text2, marginTop: 12 }}>Validando acesso...</Text>
      </View>
    );
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
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{'NOVA\nSENHA'}</Text>
          <Text style={styles.subtitle}>Crie uma senha forte para sua segurança.</Text>
        </View>

        {erro !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        )}

        {sucesso !== '' && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{sucesso}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>NOVA SENHA</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, senhaFocused && styles.inputFocused, styles.passwordInput]}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor={colors.text3}
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={(v) => { setSenha(v); setErro(''); setSucesso(''); }}
              onFocus={() => setSenhaFocused(true)}
              onBlur={() => setSenhaFocused(false)}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.showPasswordBtn}
              onPress={() => setMostrarSenha(prev => !prev)}
            >
              <Ionicons name={mostrarSenha ? "eye-off" : "eye"} size={20} color={colors.text2} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>CONFIRMAR SENHA</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[
                styles.input, 
                confirmarFocused && styles.inputFocused, 
                senhasDiferentes && styles.inputError,
                styles.passwordInput
              ]}
              placeholder="Repita a nova senha"
              placeholderTextColor={colors.text3}
              secureTextEntry={!mostrarConfirmarSenha}
              value={confirmarSenha}
              onChangeText={(v) => { setConfirmarSenha(v); setErro(''); setSucesso(''); }}
              onFocus={() => setConfirmarFocused(true)}
              onBlur={() => setConfirmarFocused(false)}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.showPasswordBtn}
              onPress={() => setMostrarConfirmarSenha(prev => !prev)}
            >
              <Ionicons 
                name={mostrarConfirmarSenha ? "eye-off" : "eye"} 
                size={20} 
                color={senhasDiferentes ? colors.red : colors.text2} 
              />
            </TouchableOpacity>
          </View>
          {senhasDiferentes && (
            <Text style={styles.helperErrorText}>As senhas não coincidem</Text>
          )}
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
          onPress={handleBack}
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
  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 32 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 36, letterSpacing: 2, color: colors.text, lineHeight: 38, fontWeight: '700' },
  subtitle: { color: colors.text2, fontSize: 13, marginTop: 8 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '600', color: colors.text3, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  input: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 16, paddingVertical: 14, color: colors.text, fontSize: 14 },
  inputFocused: { borderColor: colors.red },
  inputError: { borderColor: '#f87171' },
  helperErrorText: { color: '#f87171', fontSize: 11, marginTop: 4, fontWeight: '500' },
  errorBox: { backgroundColor: 'rgba(229,48,48,0.1)', borderWidth: 1, borderColor: 'rgba(229,48,48,0.3)', borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 },
  successBox: { backgroundColor: 'rgba(74,222,128,0.1)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)', borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 },
  successText: { color: '#4ade80', fontSize: 13, textAlign: 'center', fontWeight: '600' },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  passwordInput: { flex: 1 },
  showPasswordBtn: { padding: 12, backgroundColor: colors.surface2, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  errorText: { color: '#f87171', fontSize: 13, textAlign: 'center' },
  btnPrimary: { backgroundColor: colors.red, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: colors.red, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  btnPrimaryDisabled: { opacity: 0.65 },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
  loginLinkWrap: { alignItems: 'center', marginTop: 24 },
  loginLink: { color: colors.text2, fontSize: 13 },
});