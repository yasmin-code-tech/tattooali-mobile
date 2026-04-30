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
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

function formatPhoneBR(digits) {
  const d = String(digits || '').replace(/\D/g, '');
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return d;
}

function formatCpfDisplay(digits) {
  const d = String(digits || '').replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatDateBRFromIso(iso) {
  if (!iso) return '';
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '';
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function draftFromUser(u) {
  if (!u) return null;
  const name =
    [u.nome, u.sobrenome].filter(Boolean).join(' ').trim() || '';
  return {
    name,
    cpf: formatCpfDisplay(u.cpf),
    email: u.email || '',
    phone: formatPhoneBR(u.telefone),
    birth: formatDateBRFromIso(u.data_nascimento),
    gender: u.genero || 'Prefiro não dizer',
    cidade: u.cidade && u.cidade.trim() ? u.cidade : '—',
    estado: u.uf && String(u.uf).trim() ? String(u.uf).trim().toUpperCase() : 'SP',
    endereco: u.endereco && String(u.endereco).trim() ? String(u.endereco).trim() : '',
    observacoes: u.bio && String(u.bio).trim() ? String(u.bio).trim() : '',
    style: u.estilo_favorito && u.estilo_favorito.trim() ? u.estilo_favorito : 'Realismo',
    avatarImg: u.foto || null,
    avatarIcon: 'person',
  };
}

/** — ou vazio → null; DD/MM/AAAA → YYYY-MM-DD; inválido → undefined */
function parseBirthForApi(br) {
  const s = String(br || '').trim();
  if (!s || s === '—') return { ok: true, value: null };
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return { ok: false };
  return { ok: true, value: `${m[3]}-${m[2]}-${m[1]}` };
}

/** Primeira palavra = nome; resto = sobrenome. Uma palavra só → sobrenome igual (API exige ≥3 em ambos). */
function splitNomeSobrenome(fullName) {
  const t = String(fullName || '').trim().replace(/\s+/g, ' ');
  const parts = t.split(' ');
  const nome = parts[0] || '';
  const sobrenome = parts.length > 1 ? parts.slice(1).join(' ') : nome;
  return { nome, sobrenome };
}

const GENDER_OPTIONS = ['Masculino', 'Feminino', 'Não-binário', 'Prefiro não dizer'];
const ESTADO_OPTIONS = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'CE', 'PE', 'GO', 'DF', 'AM'];
const STYLE_OPTIONS  = ['Realismo', 'Old School', 'Blackwork', 'Minimalista', 'Aquarela', 'Geométrico', 'Neotradicional', 'Japonês'];

const AVATAR_OPTIONS = [
  { icon: 'color-palette', label: 'Avatar — Artista',       bg: 'rgba(229,48,48,0.12)',  color: '#e53030' },
  { icon: 'diamond',       label: 'Avatar — Colecionador',  bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  { icon: 'flame',         label: 'Avatar — Dragão',        bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
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
          <TouchableOpacity style={styles.selectSheet} activeOpacity={1}>
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
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function EditarPerfilScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, refreshUser } = useAuth();

  const routeProfile = route?.params?.profile;
  const userRef = useRef(user);
  userRef.current = user;

  const [draft, setDraft] = useState(() => {
    const fromUser = draftFromUser(user);
    if (fromUser) {
      return {
        ...fromUser,
        ...(routeProfile && {
          avatarIcon: routeProfile.avatarIcon || 'person',
          avatarImg: routeProfile.avatarImg,
        }),
      };
    }
    return (
      routeProfile ?? {
        name: '',
        cpf: '',
        email: '',
        phone: '',
        birth: '',
        gender: 'Prefiro não dizer',
        cidade: '—',
        estado: 'SP',
        endereco: '',
        observacoes: '',
        style: 'Realismo',
        avatarImg: null,
        avatarIcon: 'person',
      }
    );
  });
  const [photoSheet, setPhotoSheet] = useState(false);
  const [toast, setToast] = useState({ visible: false, msg: '', color: '#4ade80' });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fromUser = draftFromUser(userRef.current);
      if (!fromUser) return;
      const rp = route?.params?.profile;
      setDraft({
        ...fromUser,
        avatarIcon: rp?.avatarIcon ?? fromUser.avatarIcon,
        avatarImg: rp?.avatarImg ?? fromUser.avatarImg,
      });
    }, [route?.params?.profile]),
  );

  const scrollRef  = useRef(null);
  const fileRef    = useRef(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg, color = '#4ade80') => {
    clearTimeout(toastTimer.current);
    setToast({ visible: true, msg, color });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }, []);

  async function handleSave() {
    if (!draft.name.trim()) {
      showToast('Preencha o nome completo ⚠️', '#f59e0b');
      return;
    }
    const { nome, sobrenome } = splitNomeSobrenome(draft.name);
    if (nome.length < 3 || sobrenome.length < 3) {
      showToast(
        'Use nome e sobrenome (cada parte com pelo menos 3 letras). Ex.: Maria Silva.',
        '#f59e0b',
      );
      return;
    }

    const cpfDigits = String(draft.cpf || '').replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      showToast('Informe um CPF com 11 dígitos.', '#f59e0b');
      return;
    }

    const birthParsed = parseBirthForApi(draft.birth);
    if (!birthParsed.ok) {
      showToast('Data inválida. Use DD/MM/AAAA ou deixe em —.', '#f59e0b');
      return;
    }

    const body = { nome, sobrenome, cpf: cpfDigits };
    body.data_nascimento = birthParsed.value;
    body.genero =
      draft.gender && draft.gender !== 'Prefiro não dizer' ? draft.gender : '';
    body.cidade = draft.cidade && draft.cidade !== '—' ? draft.cidade.trim() : '';
    body.uf =
      draft.estado && String(draft.estado).trim().length === 2
        ? String(draft.estado).trim().toUpperCase()
        : '';
    body.estilo_favorito =
      draft.style && draft.style.trim() ? draft.style.trim() : '';

    body.endereco =
      draft.endereco != null ? String(draft.endereco).trim().slice(0, 255) : '';

    const obs = String(draft.observacoes || '').trim();
    const prevBio = String(user?.bio || '').trim();
    if (obs) {
      body.bio = obs.slice(0, 480);
    } else if (prevBio) {
      body.bio = '';
    }

    const telDigits = String(draft.phone || '').replace(/\D/g, '');
    if (telDigits.length >= 9 && telDigits.length <= 11) {
      body.telefone = telDigits;
    } else if (telDigits.length === 0) {
      body.telefone = '';
    }

    setSaving(true);
    try {
      await api.put('/api/perfil', body);
      await refreshUser();
      showToast('Perfil salvo no servidor ✓', '#4ade80');
      navigation.navigate('Perfil');
    } catch (e) {
      const msg =
        e?.data?.message ||
        e?.message ||
        'Não foi possível salvar. Tente de novo.';
      showToast(String(msg), '#f87171');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    navigation.goBack();
  }

  async function pickImage() {
    setPhotoSheet(false);
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const imageAsset = result.assets[0];
      const imageUri = imageAsset.uri;
      setDraft(prev => ({ ...prev, avatarImg: imageUri, avatarIcon: null }));
      setUploadingPhoto(true);
      try {
        const formData = new FormData();
        formData.append('image', {
          uri: imageUri,
          name: imageAsset.fileName || `perfil-${Date.now()}.jpg`,
          type: imageAsset.mimeType || 'image/jpeg',
        });
        const data = await api.post('/api/image/perfil/', formData);
        const remoteUrl = data?.image || imageUri;
        setDraft(prev => ({ ...prev, avatarImg: remoteUrl, avatarIcon: null }));
        await refreshUser();
        showToast('Foto de perfil atualizada ✓', '#4ade80');
      } catch (e) {
        const msg =
          e?.data?.message ||
          e?.message ||
          'Nao foi possivel enviar a foto.';
        showToast(String(msg), '#f87171');
      } finally {
        setUploadingPhoto(false);
      }
    }
  }

  // Mantido apenas por compatibilidade caso use na web e queira usar o botão invisível.
  async function handleFileUpload(e) {
    const file = e.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDraft((prev) => ({ ...prev, avatarImg: ev.target.result, avatarIcon: null }));
    };
    reader.readAsDataURL(file);

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const data = await api.post('/api/image/perfil/', formData);
      const remoteUrl = data?.image || null;
      if (remoteUrl) {
        setDraft((prev) => ({ ...prev, avatarImg: remoteUrl, avatarIcon: null }));
      }
      await refreshUser();
      showToast('Foto de perfil atualizada ✓', '#4ade80');
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.message ||
        'Nao foi possivel enviar a foto.';
      showToast(String(msg), '#f87171');
    } finally {
      setUploadingPhoto(false);
    }

    e.target.value = '';
  }

  function useIcon(iconName) {
    setDraft(prev => ({ ...prev, avatarImg: null, avatarIcon: iconName }));
    setPhotoSheet(false);
    showToast('Avatar atualizado ✓', '#4ade80');
  }

  function removePhoto() {
    setDraft(prev => ({ ...prev, avatarImg: null, avatarIcon: 'person' }));
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
                : <Ionicons name={draft.avatarIcon || 'person'} size={40} color={colors.text3} />
              }
            </View>
            <View style={styles.avatarBadge}>
              <Ionicons name="pencil" size={12} color="#fff" />
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
            <Text style={styles.inputLabel}>CPF</Text>
            <TextInput
              style={styles.input}
              value={draft.cpf}
              onChangeText={v => {
                const d = String(v || '').replace(/\D/g, '').slice(0, 11);
                setDraft(p => ({ ...p, cpf: formatCpfDisplay(d) }));
              }}
              keyboardType="number-pad"
              placeholder="000.000.000-00"
              placeholderTextColor={colors.text3}
            />
            <Text style={styles.inputHint}>
              Precisa ser o mesmo da ficha na agenda do tatuador para suas sessões aparecerem corretamente.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL (LOGIN)</Text>
            <TextInput
              style={[styles.input, styles.inputReadonly]}
              value={draft.email}
              editable={false}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={colors.text3}
            />
            <Text style={styles.inputHint}>
              O e-mail de acesso é gerenciado pelo cadastro; altere só pelo fluxo de suporte se precisar.
            </Text>
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
                onChangeText={v => {
                  let d = v.replace(/\D/g, '').slice(0, 8);
                  if (d.length >= 5) {
                    d = `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
                  } else if (d.length >= 3) {
                    d = `${d.slice(0, 2)}/${d.slice(2)}`;
                  }
                  setDraft(p => ({ ...p, birth: d }));
                }}
                keyboardType="number-pad"
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

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ENDEREÇO (RUA E NÚMERO)</Text>
            <TextInput
              style={styles.input}
              value={draft.endereco}
              onChangeText={v => setDraft(p => ({ ...p, endereco: v }))}
              placeholder="Ex.: Rua Leão Veloso, 667"
              placeholderTextColor={colors.text3}
              autoCapitalize="sentences"
            />
            <Text style={styles.inputHint}>
              Aparece na ficha que o tatuador vê no painel web (junto com cidade/UF).
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>OBSERVAÇÕES PARA O TATUADOR</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={draft.observacoes}
              onChangeText={v => setDraft(p => ({ ...p, observacoes: v }))}
              placeholder="Preferências, alergias, contexto da tatuagem…"
              placeholderTextColor={colors.text3}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.inputHint}>
              Mesmo campo “Observações” do modal de cliente no web.
            </Text>
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
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, saving && styles.btnDisabled]}
              onPress={handleSave}
              activeOpacity={0.85}
            disabled={saving || uploadingPhoto}
            >
              {saving || uploadingPhoto ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>✓ Salvar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnOutline]}
              onPress={handleCancel}
              activeOpacity={0.85}
              disabled={saving || uploadingPhoto}
            >
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
                if (Platform.OS === 'web') {
                  setPhotoSheet(false);
                  fileRef.current?.click();
                } else {
                  pickImage();
                }
              }}
            >
              <View style={[styles.sheetOptionIcon, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
                <Ionicons name="folder-outline" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.sheetOptionLabel}>Escolher da galeria</Text>
            </TouchableOpacity>

            {AVATAR_OPTIONS.map(opt => (
              <TouchableOpacity key={opt.icon} style={styles.sheetOption} onPress={() => useIcon(opt.icon)}>
                <View style={[styles.sheetOptionIcon, { backgroundColor: opt.bg }]}>
                  <Ionicons name={opt.icon} size={20} color={opt.color} />
                </View>
                <Text style={styles.sheetOptionLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.sheetOption} onPress={removePhoto}>
              <View style={[styles.sheetOptionIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
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
  inputReadonly: {
    opacity: 0.65,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: 13,
  },
  inputHint: {
    marginTop: 6,
    fontSize: 11,
    color: colors.text3,
    lineHeight: 15,
  },
  btnDisabled: {
    opacity: 0.7,
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
