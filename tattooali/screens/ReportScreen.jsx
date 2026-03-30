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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// ─── DESIGN TOKENS ────────────────────────────────────────────
const C = {
  bg:          '#0c0c0e',
  surface:     '#161618',
  surface2:    '#222226',
  border:      '#303036',
  borderFocus: '#e8281e',
  red:         '#e8281e',
  redDim:      'rgba(232,40,30,0.15)',
  redGlow:     'rgba(232,40,30,0.30)',
  mist:        '#44444c',
  smoke:       '#7a7a88',
  ash:         '#b0b0be',
  white:       '#ffffff',
  error:       '#f87171',
  success:     '#4ade80',
};

const DESC_MAX = 500;

// ─── INITIAL FORM STATE ───────────────────────────────────────
const EMPTY_FORM = {
  descricao:   '',
  denunciante: '',
  denunciado:  '',
  moderador:   '',
};

const EMPTY_ERRORS = {
  descricao:   '',
  denunciante: '',
  denunciado:  '',
  moderador:   '',
};

// ─── FIELD COMPONENT ──────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <View style={field.wrap}>
    <Text style={field.label}>{label}</Text>
    {children}
    {!!error && <Text style={field.error}>{error}</Text>}
  </View>
);

const field = StyleSheet.create({
  wrap:  { marginBottom: 14 },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: C.smoke,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  error: {
    fontSize: 11,
    color: C.error,
    marginTop: 5,
  },
});

// ─── REPORT SCREEN ─────────────────────────────────────────────
export default function ReportScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { denunciado } = route.params || {};

  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState(EMPTY_ERRORS);
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  // ── Initialize form ──────────────────────────────────────────
  useEffect(() => {
    if (denunciado) {
      setForm(prev => ({
        ...prev,
        denunciado: denunciado,
      }));
    }
  }, [denunciado]);

  // ── Field update ────────────────────────────────────────────
  const handleChange = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  }, [errors]);

  // ── Validation ──────────────────────────────────────────────
  const validate = useCallback(() => {
    const next = { ...EMPTY_ERRORS };
    let valid = true;

    if (!form.descricao.trim()) {
      next.descricao = 'A descrição é obrigatória.';
      valid = false;
    } else if (form.descricao.trim().length < 10) {
      next.descricao = 'Descreva com pelo menos 10 caracteres.';
      valid = false;
    }
    if (!form.denunciante.trim()) {
      next.denunciante = 'Informe o denunciante.';
      valid = false;
    }
    if (!form.denunciado.trim()) {
      next.denunciado = 'Informe o denunciado.';
      valid = false;
    }
    if (!form.moderador.trim()) {
      next.moderador = 'Informe o moderador responsável.';
      valid = false;
    }

    setErrors(next);
    return valid;
  }, [form]);

  const isFormDirty = (
    form.descricao.trim().length >= 10 &&
    form.denunciante.trim() &&
    form.denunciado.trim() &&
    form.moderador.trim()
  );

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss();
    if (!validate()) return;

    setLoading(true);

    const payload = {
      descricao:   form.descricao.trim(),
      denunciante: form.denunciante.trim(),
      denunciado:  form.denunciado.trim(),
      moderador:   form.moderador.trim(),
      status:      'pendente',
    };

    try {
      // Simulated async call — replace with real API
      await new Promise(res => setTimeout(res, 1200));
      console.log('[ReportScreen] Denúncia enviada:', payload);
      setSent(true);
      setTimeout(() => navigation.goBack(), 1800);
    } catch (err) {
      console.error('[ReportScreen] Erro ao enviar:', err);
    } finally {
      setLoading(false);
    }
  }, [form, validate, navigation]);

  // ── Success state ───────────────────────────────────────────
  const SuccessView = () => (
    <View style={styles.successWrap}>
      <Text style={styles.successIcon}>✅</Text>
      <Text style={styles.successTitle}>Denúncia enviada!</Text>
      <Text style={styles.successSub}>Nossa equipe irá analisar em breve.</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <KeyboardAvoidingView
          style={styles.kavWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={C.white} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Registrar Denúncia</Text>
              <Text style={styles.headerSub}>
                Todos os campos são obrigatórios
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Content */}
          {sent ? (
            <SuccessView />
          ) : (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Descrição */}
              <Field label="Descrição da ocorrência" error={errors.descricao}>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputMultiline,
                    !!errors.descricao && styles.inputError,
                  ]}
                  value={form.descricao}
                  onChangeText={v => handleChange('descricao', v)}
                  placeholder="Descreva detalhadamente o ocorrido…"
                  placeholderTextColor={C.mist}
                  multiline
                  maxLength={DESC_MAX}
                  textAlignVertical="top"
                />
                <View style={styles.charRow}>
                  <Text
                    style={[
                      styles.charCount,
                      form.descricao.length >= DESC_MAX && styles.charCountMax,
                    ]}
                  >
                    {form.descricao.length}/{DESC_MAX}
                  </Text>
                </View>
              </Field>

              {/* Denunciante */}
              <Field label="Denunciante" error={errors.denunciante}>
                <TextInput
                  style={[styles.input, !!errors.denunciante && styles.inputError]}
                  value={form.denunciante}
                  onChangeText={v => handleChange('denunciante', v)}
                  placeholder="Nome ou ID do denunciante"
                  placeholderTextColor={C.mist}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </Field>

              {/* Denunciado */}
              <Field label="Denunciado" error={errors.denunciado}>
                <TextInput
                  style={[styles.input, !!errors.denunciado && styles.inputError]}
                  value={form.denunciado}
                  onChangeText={v => handleChange('denunciado', v)}
                  placeholder="Nome ou ID do denunciado"
                  placeholderTextColor={C.mist}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </Field>

              {/* Moderador */}
              <Field label="Moderador responsável" error={errors.moderador}>
                <TextInput
                  style={[styles.input, !!errors.moderador && styles.inputError]}
                  value={form.moderador}
                  onChangeText={v => handleChange('moderador', v)}
                  placeholder="Nome ou ID do moderador"
                  placeholderTextColor={C.mist}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </Field>

              {/* Status pill (read-only) */}
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>STATUS INICIAL</Text>
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>PENDENTE</Text>
                </View>
              </View>
            </ScrollView>
          )}

          {/* Footer */}
          {!sent && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!isFormDirty || loading) && styles.submitBtnDisabled,
                ]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={!isFormDirty || loading}
              >
                {loading ? (
                  <ActivityIndicator color={C.white} size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Enviar denúncia</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── KAV wrapper ─────────────────────────────────────────────
  kavWrap: {
    flex: 1,
  },

  // ── Header ──────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 40 : 46,
    paddingBottom: 16,
    backgroundColor: C.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    color: C.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSub: {
    color: C.smoke,
    fontSize: 12,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 0,
  },

  // ── Scroll ──────────────────────────────────────────────────
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },

  // ── Inputs ──────────────────────────────────────────────────
  input: {
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: C.white,
    fontSize: 14,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: 13,
  },
  inputError: {
    borderColor: C.error,
  },

  // ── Char counter ────────────────────────────────────────────
  charRow: {
    alignItems: 'flex-end',
    marginTop: 5,
  },
  charCount: {
    fontSize: 10,
    color: C.smoke,
    letterSpacing: 0.3,
  },
  charCountMax: {
    color: C.error,
  },

  // ── Status row ──────────────────────────────────────────────
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surface2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: C.smoke,
    letterSpacing: 1.2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250,204,21,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#facc15',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#facc15',
    letterSpacing: 0.8,
  },

  // ── Footer ──────────────────────────────────────────────────
  footer: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  submitBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: C.red,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  submitBtnDisabled: {
    backgroundColor: C.mist,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Success ─────────────────────────────────────────────────
  successWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 10,
  },
  successIcon: {
    fontSize: 48,
  },
  successTitle: {
    color: C.white,
    fontSize: 20,
    fontWeight: '800',
  },
  successSub: {
    color: C.smoke,
    fontSize: 13,
    textAlign: 'center',
  },
});