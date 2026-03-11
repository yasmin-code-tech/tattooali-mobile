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
import { colors, radius } from '../../theme';

export default function CadastroScreen() {
  const navigation = useNavigation();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [cpf,setCpf] = useState('');
    
  const [tipoConta, setTipoConta] = useState('cliente');

  const [nomeFocused, setNomeFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);
  const [confirmarFocused, setConfirmarFocused] = useState(false);
  const [cpfFocused, setCpfFocused] = useState(false);

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
          <Text style={styles.label}>NOME COMPLETO</Text>
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
          <TextInput
            style={[styles.input, senhaFocused && styles.inputFocused]}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor={colors.text3}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            onFocus={() => setSenhaFocused(true)}
            onBlur={() => setSenhaFocused(false)}
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
            onChangeText={setConfirmarSenha}
            onFocus={() => setConfirmarFocused(true)}
            onBlur={() => setConfirmarFocused(false)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>TIPO DE CONTA</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeOption, tipoConta === 'cliente' && styles.typeOptionSelected]}
              onPress={() => setTipoConta('cliente')}
            >
              <Text style={[styles.typeOptionText, tipoConta === 'cliente' && styles.typeOptionTextSelected]}>
                🙋 Cliente
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeOption, tipoConta === 'tatuador' && styles.typeOptionSelected]}
              onPress={() => setTipoConta('tatuador')}
            >
              <Text style={[styles.typeOptionText, tipoConta === 'tatuador' && styles.typeOptionTextSelected]}>
                🎨 Tatuador
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.85}>
          <Text style={styles.btnPrimaryText}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLinkWrap} onPress={() => navigation.navigate('Login')}>
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
  typeSelector: { flexDirection: 'row', gap: 10 },
  typeOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    alignItems: 'center',
  },
  typeOptionSelected: { borderColor: colors.red, backgroundColor: colors.redGlow },
  typeOptionText: { fontSize: 13, fontWeight: '600', color: colors.text2 },
  typeOptionTextSelected: { color: colors.red },
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
  loginLinkWrap: { alignItems: 'center', marginTop: 16 },
  loginLink: { color: colors.text2, fontSize: 13 },
});