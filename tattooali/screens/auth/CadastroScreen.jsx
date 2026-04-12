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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radius } from '../../theme';
import { useAuth } from '../../context/AuthContext';

export default function CadastroScreen() {
  const navigation = useNavigation();
  const { register } = useAuth();

  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [cpf, setCpf] = useState('');

  const [nomeFocused, setNomeFocused] = useState(false);
  const [sobrenomeFocused, setSobrenomeFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);
  const [confirmarFocused, setConfirmarFocused] = useState(false);
  const [cpfFocused, setCpfFocused] = useState(false);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function handleCadastrar() {
    setErro('');
    const n = nome.trim();
    const s = sobrenome.trim();
    const cpfDigits = cpf.replace(/\D/g, '');

    if (n.length < 3) {
      setErro('Nome deve ter pelo menos 3 caracteres.');
      return;
    }
    if (s.length < 3) {
      setErro('Sobrenome deve ter pelo menos 3 caracteres.');
      return;
    }
    if (cpfDigits.length !== 11) {
      setErro('Informe o CPF com 11 dígitos.');
      return;
    }
    if (!email.trim()) {
      setErro('Informe seu e-mail.');
      return;
    }
    if (senha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        nome: n,
        sobrenome: s,
        cpf: cpfDigits,
        email: email.trim().toLowerCase(),
        senha,
        role: 'cliente',
      });
      Alert.alert(
        'Conta criada',
        res?.message || 'Verifique seu e-mail para confirmar a conta, se necessário.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
      );
    } catch (e) {
      setErro(e?.message || e?.data?.error || 'Não foi possível concluir o cadastro.');
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
          <Text style={styles.title}>{'CRIAR\nCONTA'}</Text>
          <Text style={styles.subtitle}>Junte-se à comunidade Tattoali</Text>
        </View>

        {erro !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>NOME</Text>
          <TextInput
            style={[styles.input, nomeFocused && styles.inputFocused]}
            placeholder="Seu nome"
            placeholderTextColor={colors.text3}
            autoCapitalize="words"
            value={nome}
            onChangeText={(v) => { setNome(v); setErro(''); }}
            onFocus={() => setNomeFocused(true)}
            onBlur={() => setNomeFocused(false)}
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>SOBRENOME</Text>
          <TextInput
            style={[styles.input, sobrenomeFocused && styles.inputFocused]}
            placeholder="Seu sobrenome"
            placeholderTextColor={colors.text3}
            autoCapitalize="words"
            value={sobrenome}
            onChangeText={(v) => { setSobrenome(v); setErro(''); }}
            onFocus={() => setSobrenomeFocused(true)}
            onBlur={() => setSobrenomeFocused(false)}
            editable={!loading}
          />
        </View>

        <View>
          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={[styles.input, cpfFocused && styles.inputFocused]}
            placeholder="000.000.000-00"
            placeholderTextColor={colors.text3}
            keyboardType="numeric"
            value={cpf}
            onChangeText={(v) => { setCpf(v); setErro(''); }}
            onFocus={() => setCpfFocused(true)}
            onBlur={() => setCpfFocused(false)}
            editable={!loading}
          />
        </View>

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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>SENHA</Text>
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
            placeholder="Repita sua senha"
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
          onPress={handleCadastrar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnPrimaryText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLinkWrap}
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
        >
          <Text style={styles.loginLink}>Já tenho conta</Text>
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
    paddingBottom: 30,
  },
  header: { marginBottom: 28 },
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
  subtitle: { color: colors.text2, fontSize: 13, marginTop: 6 },
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
  btnPrimary: {
    backgroundColor: colors.red,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
  btnPrimaryDisabled: { opacity: 0.65 },
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
  loginLinkWrap: { alignItems: 'center', marginTop: 16 },
  loginLink: { color: colors.text2, fontSize: 13 },
});