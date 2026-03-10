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

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);

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
        <View style={styles.logoArea}>
          <View style={styles.logoMark}>
            <Text style={styles.logoSvgPlaceholder}>👤</Text>
          </View>
          <Text style={styles.logoTitle}>TATTOALI</Text>
          <Text style={styles.logoSub}>Seu próximo traço começa aqui</Text>
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
            placeholder="••••••••"
            placeholderTextColor={colors.text3}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            onFocus={() => setSenhaFocused(true)}
            onBlur={() => setSenhaFocused(false)}
          />
        </View>

        <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.85}>
          <Text style={styles.btnPrimaryText}>Entrar</Text>
        </TouchableOpacity>

        <View style={styles.authLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
            <Text style={styles.authLink}>Criar conta</Text>
          </TouchableOpacity>
          <Text style={styles.authDivider}>•</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EsqueciSenha')}>
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
  logoArea: { alignItems: 'center', marginBottom: 48 },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
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
    marginTop: 8,
    marginBottom: 20,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  authLinks: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  authLink: { color: colors.text2, fontSize: 13 },
  authDivider: { color: colors.text3, fontSize: 11 },
});