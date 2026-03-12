import React, { useState } from 'react';
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
  Alert,Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radius } from '../../theme';
import { useAuth } from '../../context/AuthContext';


export default function LoginScreen() {
  const navigation = useNavigation();
  const { login }  = useAuth();

  const [email, setEmail]               = useState('');
  const [senha, setSenha]               = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [erro, setErro]                 = useState('');

  async function handleLogin() {
    // Validação local antes de chamar o contexto
    if (!email.trim()) {
      setErro('Informe seu e-mail.');
      return;
    }
    if (!senha) {
      setErro('Informe sua senha.');
      return;
    }

    setErro('');
    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), senha);
      // RootNavigator detecta isAuthenticated e redireciona automaticamente
    } catch (e) {
      setErro(e.message ?? 'Erro ao fazer login. Tente novamente.');
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
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoMark}>
            < Image 
            source = {require('../../assets/logo.png')}
            style={styles.logoImage}
            
            />
          </View>
          <Text style={styles.logoTitle}>TATTOOALI</Text>
          <Text style={styles.logoSub}>Seu próximo traço começa aqui</Text>
        </View>

        {/* Erro global */}
        {erro !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        )}

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={[
              styles.input,
              emailFocused && styles.inputFocused,
              erro && !email && styles.inputError,
            ]}
            placeholder="seuemail@email.com"
            placeholderTextColor={colors.text3}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={v => { setEmail(v); setErro(''); }}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            editable={!loading}
          />
        </View>

        {/* Senha */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>SENHA</Text>
          <TextInput
            style={[
              styles.input,
              senhaFocused && styles.inputFocused,
              erro && !senha && styles.inputError,
            ]}
            placeholder="••••••••"
            placeholderTextColor={colors.text3}
            secureTextEntry
            value={senha}
            onChangeText={v => { setSenha(v); setErro(''); }}
            onFocus={() => setSenhaFocused(true)}
            onBlur={() => setSenhaFocused(false)}
            onSubmitEditing={handleLogin}
            returnKeyType="done"
            editable={!loading}
          />
        </View>

        {/* Botão Entrar */}
        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnPrimaryDisabled]}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnPrimaryText}>Entrar</Text>
          }
        </TouchableOpacity>

        {/* Links */}
        <View style={styles.authLinks}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Cadastro')}
            disabled={loading}
          >
            <Text style={styles.authLink}>Criar conta</Text>
          </TouchableOpacity>
          <Text style={styles.authDivider}>•</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('EsqueciSenha')}
            disabled={loading}
          >
            <Text style={styles.authLink}>Esqueci minha senha</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 60,
  },

  // Logo
  logoArea:          { alignItems: 'center', marginBottom: 48 },
  logoMark: {
    width: 128,
    height: 128,
    borderRadius: 22,
    borderColor: colors.red,
    borderWidth: 2,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    
  },
  logoSvgPlaceholder: { fontSize: 30 },
  logoTitle: {
    fontSize: 44,
    letterSpacing: 3,
    color: colors.text,
    lineHeight: 48,
    fontWeight: '700',
  },
  logoSub: { color: colors.text2, fontSize: 13, marginTop: 6 },
  logoImage :{
    width: 128,
    height:128,
  },
  // Erro
  errorBox: {
    backgroundColor: 'rgba(229,48,48,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229,48,48,0.3)',
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    textAlign: 'center',
  },

  // Inputs
  inputGroup:   { marginBottom: 14 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text3,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 14,
  },
  inputFocused: { borderColor: colors.red },
  inputError:   { borderColor: '#f87171' },

  // Botão
  btnPrimary: {
    backgroundColor: colors.red,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnPrimaryDisabled: {
    opacity: 0.6,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Links
  authLinks: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  authLink:    { color: colors.text2, fontSize: 13 },
  authDivider: { color: colors.text3, fontSize: 11 },
});