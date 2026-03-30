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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../theme';

export default function CadastroScreen() {
  const navigation = useNavigation();
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const API_BASE_URL = 'http://10.50.83.61:3000/api';

  async function handleRegister() {
    setError('');

    const cleanedCpf = cpf.replace(/\D/g, '');
    const cleanedTelefone = telefone.replace(/\D/g, '');

    if (!nome.trim() || !sobrenome.trim()) {
      return setError('Nome e sobrenome são obrigatórios.');
    }
    if (!email.trim()) {
      return setError('E-mail é obrigatório.');
    }
    if (!senha || !confirmarSenha) {
      return setError('Senha e confirmação de senha são obrigatórias.');
    }
    if (senha.length < 8) {
      return setError('A senha deve ter no mínimo 8 caracteres.');
    }
    if (senha !== confirmarSenha) {
      return setError('As senhas não correspondem.');
    }
    if (cleanedCpf.length !== 11) {
      return setError('CPF inválido (11 dígitos).');
    }

    const payload = {
      nome: nome.trim(),
      sobrenome: sobrenome.trim(),
      cpf: cleanedCpf,
      email: email.trim().toLowerCase(),
      senha: senha,
      role: 'cliente',
      telefone: cleanedTelefone || null,
    };

    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const body = await resp.json();

      if (!resp.ok) {
        const msg = body?.error || body?.message || `Erro ${resp.status}`;
        setError(`Não foi possível cadastrar: ${msg}`);
        return;
      }

      setError('Cadastro realizado com sucesso! Verifique seu e-mail e faça login.');
      setTimeout(() => navigation.navigate('Login'), 1500);
    } catch (err) {
      setError('Falha na comunicação com o servidor. Tente novamente.');
      console.error('[CadastroScreen] handleRegister', err);
    } finally {
      setLoading(false);
    }
  }

  const [nomeFocused, setNomeFocused] = useState(false);
  const [sobrenomeFocused, setSobrenomeFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);
  const [confirmarFocused, setConfirmarFocused] = useState(false);
  const [cpfFocused, setCpfFocused] = useState(false);
  const [telefoneFocused, setTelefoneFocused] = useState(false);

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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>NOME</Text>
          <TextInput
            style={[styles.input, nomeFocused && styles.inputFocused]}
            placeholder="Seu nome"
            placeholderTextColor={colors.text3}
            autoCapitalize="words"
            value={nome}
            onChangeText={setNome}
            onFocus={() => setNomeFocused(true)}
            onBlur={() => setNomeFocused(false)}
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
            onChangeText={setSobrenome}
            onFocus={() => setSobrenomeFocused(true)}
            onBlur={() => setSobrenomeFocused(false)}
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
            onChangeText={setCpf}
            onFocus={() => setCpfFocused(true)}
            onBlur={() => setCpfFocused(false)}
          />
        </View>

        <View>
          <Text style={styles.label}>CELULAR (opcional)</Text>
          <TextInput
            style={[styles.input, telefoneFocused && styles.inputFocused]}
            placeholder="11999998888"
            placeholderTextColor={colors.text3}
            keyboardType="numeric"
            value={telefone}
            onChangeText={setTelefone}
            onFocus={() => setTelefoneFocused(true)}
            onBlur={() => setTelefoneFocused(false)}
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
            onChangeText={setEmail}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>SENHA</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, senhaFocused && styles.inputFocused, styles.passwordInput]}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor={colors.text3}
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={setSenha}
              onFocus={() => setSenhaFocused(true)}
              onBlur={() => setSenhaFocused(false)}
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
              style={[styles.input, confirmarFocused && styles.inputFocused, styles.passwordInput]}
              placeholder="Repita sua senha"
              placeholderTextColor={colors.text3}
              secureTextEntry={!mostrarSenha}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              onFocus={() => setConfirmarFocused(true)}
              onBlur={() => setConfirmarFocused(false)}
            />
            <TouchableOpacity
              style={styles.showPasswordBtn}
              onPress={() => setMostrarSenha(prev => !prev)}
            >
              <Ionicons name={mostrarSenha ? "eye-off" : "eye"} size={20} color={colors.text2} />
            </TouchableOpacity>
          </View>
        </View>

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnPrimaryDisabled]}
          activeOpacity={0.85}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.btnPrimaryText}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Text>
        </TouchableOpacity>

        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginTexto}>Já tenho conta</Text>
          <TouchableOpacity style={styles.loginLinkWrap} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Entrar</Text>
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    marginRight: 10,
  },
  showPasswordBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.surface2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorBox: {
    backgroundColor: '#4f1f1f',
    borderColor: '#7f1d1d',
    borderWidth: 1,
    marginVertical: 10,
    padding: 10,
    borderRadius: radius.sm,
  },
  errorText: { color: '#fda4af', fontSize: 12 },
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
  btnPrimaryDisabled: {
    backgroundColor: '#8f1f1f',
  },
  loginLinkWrap: { alignItems: 'center'},
  loginLink: { color: colors.text2, fontSize: 13 , fontWeight: '600', textDecorationLine:'underline'},
    loginLinkContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 16,
    },
    loginTexto: {
      color: colors.text2,
      fontSize: 13,
      marginRight: 6,
      
    },
  });