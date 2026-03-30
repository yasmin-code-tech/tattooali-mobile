import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const GENDER_OPTIONS = ['Masculino', 'Feminino', 'Não-binário', 'Prefiro não dizer'];
const ESTADO_OPTIONS = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'CE', 'PE', 'GO', 'DF', 'AM'];
const STYLE_OPTIONS  = ['Realismo', 'Old School', 'Blackwork', 'Minimalista', 'Aquarela', 'Geométrico', 'Neotradicional', 'Japonês'];

const AVATAR_OPTIONS = [
  { emoji: '🎨', label: 'Avatar — Artista',       bg: 'rgba(229,48,48,0.12)'  },
  { emoji: '🦅', label: 'Avatar — Colecionador',  bg: 'rgba(245,158,11,0.12)' },
  { emoji: '🐉', label: 'Avatar — Dragão',         bg: 'rgba(139,92,246,0.12)' },
];

function SimpleSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={{ color: value ? colors.text : colors.text3, fontSize: 14 }}>
          {value || 'Selecionar'}
        </Text>
        <Text style={{ color: colors.text3, fontSize: 12 }}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.selectOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.selectSheet}>
            {options.map(opt => (
              <TouchableOpacity
                key={opt}
                style={styles.selectOption}
                onPress={() => { onChange(opt); setOpen(false); }}
              >
                <Text style={[styles.selectOptionText, opt === value && styles.selectOptionActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function EditarPerfilScreen() {
  const navigation = useNavigation();
  const route      = useRoute();

  const initialProfile = route?.params?.profile ?? {
    name:        'João Pedro Lima',
    email:       'joao@email.com',
    phone:       '(11) 99999-0000',
    birth:       '12/05/1995',
    gender:      'Masculino',
    cidade:      'São Paulo',
    estado:      'SP',
    style:       'Realismo',
    avatarImg:   null,
    avatarEmoji: '👤',
  };

  const [draft, setDraft]           = useState({ ...initialProfile });
  const [photoSheet, setPhotoSheet] = useState(false);
  const [toast, setToast]           = useState({ visible: false, msg: '', color: '#4ade80' });

  const scrollRef  = useRef(null);
  const fileRef    = useRef(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg, color = '#4ade80') => {
    clearTimeout(toastTimer.current);
    setToast({ visible: true, msg, color });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }, []);

  function handleSave() {
    if (!draft.name.trim() || !draft.email.trim()) {
      showToast('Preencha nome e email ⚠️', '#f59e0b');
      return;
    }
    navigation.navigate('Perfil', { profile: { ...draft } });
  }

  function handleCancel() {
    navigation.goBack();
  }

  function handleFileUpload(e) {
    const file = e.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setDraft(prev => ({ ...prev, avatarImg: ev.target.result, avatarEmoji: null }));
      showToast('Foto atualizada ✓', '#4ade80');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function useEmoji(emoji) {
    setDraft(prev => ({ ...prev, avatarImg: null, avatarEmoji: emoji }));
    setPhotoSheet(false);
    showToast('Avatar atualizado ✓', '#4ade80');
  }

  function removePhoto() {
    setDraft(prev => ({ ...prev, avatarImg: null, avatarEmoji: '👤' }));
    setPhotoSheet(false);
    showToast('Foto removida', '#888');
  }

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* AVATAR */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => setPhotoSheet(true)}
            activeOpacity={0.85}
          >
            <View style={styles.avatarRing} />
            <View style={styles.clientAvatar}>
              {draft.avatarImg
                ? <Image source={{ uri: draft.avatarImg }} style={styles.avatarImage} />
                : <Text style={styles.avatarEmoji}>{draft.avatarEmoji}</Text>
              }
            </View>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>✏️</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Toque para alterar a foto</Text>
        </View>

        {/* FORM */}
        <View style={styles.formSection}>

          <Text style={styles.sectionTitle}>Informações pessoais</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NOME COMPLETO</Text>
            <TextInput
              style={styles.input}
              value={draft.name}
              onChangeText={v => setDraft(p => ({ ...p, name: v }))}
              autoCapitalize="words"
              placeholderTextColor={colors.text3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={draft.email}
              onChangeText={v => setDraft(p => ({ ...p, email: v }))}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={colors.text3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>TELEFONE</Text>
            <TextInput
              style={styles.input}
              value={draft.phone}
              onChangeText={v => setDraft(p => ({ ...p, phone: v }))}
              keyboardType="phone-pad"
              placeholderTextColor={colors.text3}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>DATA DE NASC.</Text>
              <TextInput
                style={styles.input}
                value={draft.birth}
                onChangeText={v => setDraft(p => ({ ...p, birth: v }))}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={colors.text3}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>GÊNERO</Text>
              <SimpleSelect
                value={draft.gender}
                onChange={v => setDraft(p => ({ ...p, gender: v }))}
                options={GENDER_OPTIONS}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Localização</Text>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>CIDADE</Text>
              <TextInput
                style={styles.input}
                value={draft.cidade}
                onChangeText={v => setDraft(p => ({ ...p, cidade: v }))}
                placeholderTextColor={colors.text3}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>ESTADO</Text>
              <SimpleSelect
                value={draft.estado}
                onChange={v => setDraft(p => ({ ...p, estado: v }))}
                options={ESTADO_OPTIONS}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Preferências de tatuagem</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ESTILO FAVORITO</Text>
            <SimpleSelect
              value={draft.style}
              onChange={v => setDraft(p => ({ ...p, style: v }))}
              options={STYLE_OPTIONS}
            />
          </View>

          {/* ACTIONS */}
          <View style={styles.btnActions}>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.btnPrimaryText}>✓ Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={handleCancel} activeOpacity={0.85}>
              <Text style={styles.btnOutlineText}>✕ Cancelar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* PHOTO SHEET */}
      <Modal
        visible={photoSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setPhotoSheet(false)}
      >
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setPhotoSheet(false)}
        >
          <TouchableOpacity style={styles.sheet} activeOpacity={1}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Foto de Perfil</Text>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                setPhotoSheet(false);
                if (Platform.OS === 'web') fileRef.current?.click();
              }}
            >
              <View style={[styles.sheetOptionIcon, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
                <Text style={styles.sheetOptionEmoji}>📁</Text>
              </View>
              <Text style={styles.sheetOptionLabel}>Escolher da galeria</Text>
            </TouchableOpacity>

            {AVATAR_OPTIONS.map(opt => (
              <TouchableOpacity key={opt.emoji} style={styles.sheetOption} onPress={() => useEmoji(opt.emoji)}>
                <View style={[styles.sheetOptionIcon, { backgroundColor: opt.bg }]}>
                  <Text style={styles.sheetOptionEmoji}>{opt.emoji}</Text>
                </View>
                <Text style={styles.sheetOptionLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.sheetOption} onPress={removePhoto}>
              <View style={[styles.sheetOptionIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                <Text style={styles.sheetOptionEmoji}>🗑️</Text>
              </View>
              <Text style={[styles.sheetOptionLabel, { color: '#f87171' }]}>Remover foto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetCancel} onPress={() => setPhotoSheet(false)}>
              <Text style={styles.sheetCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {Platform.OS === 'web' && (
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
      )}

      {/* TOAST */}
      {toast.visible && (
        <View style={[styles.toast, { borderLeftColor: toast.color }]}>
          <Text style={styles.toastText}>{toast.msg}</Text>
        </View>
      )}
    </View>
  );
}

const colors = {
  bg:       '#0a0a0a',
  surface:  '#141414',
  surface2: '#1c1c1c',
  border:   '#2a2a2a',
  red:      '#e53030',
  text:     '#f0f0f0',
  text2:    '#888888',
  text3:    '#555555',
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarSection: {
    paddingVertical: 28,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  avatarWrapper: {
    width: 88,
    height: 88,
  },
  avatarRing: {
    position: 'absolute',
    top: -5, left: -5, right: -5, bottom: -5,
    borderRadius: 49,
    borderWidth: 2,
    borderColor: 'rgba(229,48,48,0.4)',
    borderStyle: 'dashed',
  },
  clientAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface2,
    borderWidth: 3,
    borderColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 1, right: 1,
    width: 26, height: 26,
    borderRadius: 13,
    backgroundColor: colors.red,
    borderWidth: 2,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  avatarBadgeText: {
    fontSize: 11,
  },
  avatarHint: {
    fontSize: 12,
    color: colors.text3,
  },
  formSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text3,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: 4,
  },
  inputGroup: {
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  inputLabel: {
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
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 14,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  btnPrimary: {
    backgroundColor: colors.red,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnOutlineText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.text,
    marginBottom: 16,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sheetOptionEmoji: {
    fontSize: 20,
  },
  sheetOptionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  sheetCancel: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  sheetCancelText: {
    color: colors.text2,
    fontSize: 14,
    fontWeight: '600',
  },
  selectOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  selectSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  selectOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectOptionText: {
    fontSize: 14,
    color: colors.text2,
  },
  selectOptionActive: {
    color: colors.red,
    fontWeight: '600',
  },
  toast: {
    position: 'absolute',
    bottom: 24, left: 20, right: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 200,
  },
  toastText: {
    fontSize: 13,
    color: colors.text2,
  },
});
