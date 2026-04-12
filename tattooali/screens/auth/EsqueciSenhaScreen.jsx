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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radius } from '../../theme';
import { api } from '../../lib/api';

export default function EsqueciSenhaScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function handleEnviar() {
    if (!email.trim()) return;
    setErro('');
    setLoading(true);
    try {
      await api.post('/api/user/recuperar-senha', { email: email.trim().toLowerCase() });
      setEnviado(true);
    } catch (e) {
      setErro(e?.message || 'Não foi possível enviar o e-mail. Tente novamente.');
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
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{'ESQUECI\nMINHA SENHA'}</Text>
          <Text style={styles.subtitle}>
            {enviado
              ? 'Verifique seu e-mail e siga as instruções para redefinir sua senha.'
              : 'Informe seu e-mail e enviaremos um link para redefinir sua senha.'}
          </Text>
        </View>

        {!enviado ? (
          <>
            {erro !== '' && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{erro}</Text>
              </View>
            )}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                placeholder="seuemail@email.com"
                placeholderTextColor={colors.text3}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={(v) => { setEmail(v); setErro(''); }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                editable={!loading}
              />
            </View>
            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnPrimaryDisabled]}
              activeOpacity={0.85}
              onPress={handleEnviar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>Enviar link de redefinição</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✉️</Text>
            <Text style={styles.successTitle}>Link enviado!</Text>
            <Text style={styles.successText}>
              Enviamos um link para <Text style={styles.successEmail}>{email}</Text>. Verifique também a caixa de spam.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.loginLinkWrap} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Voltar para o login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: { marginBottom: 32 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  backBtnText: { color: colors.text, fontSize: 16 },
  title: {
    fontSize: 36,
    letterSpacing: 2,
    color: colors.text,
    lineHeight: 38,
    fontWeight: '700',
  },
  subtitle: { color: colors.text2, fontSize: 13, marginTop: 8, lineHeight: 20 },
  inputGroup: { marginBottom: 14 },
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
  errorBox: {
    backgroundColor: 'rgba(229,48,48,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229,48,48,0.3)',
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorText: { color: '#f87171', fontSize: 13, textAlign: 'center' },
  btnPrimaryDisabled: { opacity: 0.65 },
  btnPrimary: {
    backgroundColor: colors.red,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
  successBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  successIcon: { fontSize: 40, marginBottom: 12 },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  successText: { fontSize: 13, color: colors.text2, textAlign: 'center', lineHeight: 20 },
  successEmail: { color: colors.red, fontWeight: '600' },
  loginLinkWrap: { alignItems: 'center', marginTop: 24 },
  loginLink: { color: colors.text2, fontSize: 13 },
});