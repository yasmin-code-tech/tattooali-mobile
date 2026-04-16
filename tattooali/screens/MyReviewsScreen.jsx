import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';

import ReviewCard from '../components/ReviewCard';

// ─── DESIGN TOKENS (inline para arquivo autossuficiente) ──────
// Caso já tenha src/styles/tokens.js, substitua por: import { C } from '../styles/tokens'
const C = {
  bg:      '#0c0c0e',
  surface: '#161618',
  surface2:'#222226',
  border:  '#303036',
  mist:    '#44444c',
  smoke:   '#7a7a88',
  ash:     '#b0b0be',
  white:   '#ffffff',
  red:     '#e8281e',
  redDim:  'rgba(232,40,30,0.12)',
  green:   '#4ade80',
};

// ─── MOCK / API LAYER ─────────────────────────────────────────
// Substitua a URL e o token pela sua configuração real quando o
// backend estiver pronto. A assinatura da função não muda.
const API_BASE = 'https://localhost:3000';

async function fetchMinhasAvaliacoes(token) {
  // ── MOCK ──────────────────────────────────────────────────
  await new Promise(res => setTimeout(res, 1100)); // simula latência

  // Descomente para testar estado de erro:
  // throw new Error('Falha ao carregar avaliações.');

  // Descomente para testar estado vazio:
  // return [];

  return [
    {
      id: 1,
      tatuador: { nome: 'João Ink',       avatar: null, bairro: 'Aldeota' },
      nota: 5,
      comentario: 'Trabalho impecável, super recomendo! Profissional atencioso e muito cuidadoso.',
      data: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      id: 2,
      tatuador: { nome: 'Marina Bones',   avatar: null, bairro: 'Meireles' },
      nota: 4,
      comentario: 'Excelente profissional. O traço é muito preciso e o estúdio é muito limpo.',
      data: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    },
    {
      id: 3,
      tatuador: { nome: 'Tiago Dark Art', avatar: null, bairro: 'Cocó' },
      nota: 5,
      comentario: 'Realismo absurdo! Capturou cada detalhe da referência. Já agendei a próxima.',
      data: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    },
    {
      id: 4,
      tatuador: { nome: 'Camila Fine Line', avatar: null, bairro: 'Varjota' },
      nota: 3,
      comentario: 'O resultado ficou bom, mas o atendimento poderia ser melhor.',
      data: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    },
    {
      id: 5,
      tatuador: { nome: 'Renato Neo Trad', avatar: null, bairro: 'Benfica' },
      nota: 5,
      comentario: 'Um dos melhores neo-tradicional de Fortaleza. Sem dúvidas, vale cada centavo.',
      data: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    },
  ];

  // ── PRODUÇÃO (descomente quando o backend estiver pronto) ──
  // const res = await fetch(`${API_BASE}/avaliacoes/minhas`, {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${token}`,
  //   },
  // });
  // if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // const json = await res.json();
  // return json.data ?? json;
}

// ─── SKELETON CARD ────────────────────────────────────────────
const SkeletonCard = ({ pulse }) => (
  <Animated.View style={[skel.card, { opacity: pulse }]}>
    <View style={skel.topRow}>
      <View style={skel.avatar} />
      <View style={skel.lines}>
        <View style={[skel.line, { width: '60%' }]} />
        <View style={[skel.line, { width: '40%', marginTop: 6 }]} />
        <View style={[skel.line, { width: '30%', marginTop: 6 }]} />
      </View>
      <View style={skel.badge} />
    </View>
    <View style={skel.divider} />
    <View style={[skel.line, { width: '90%' }]} />
    <View style={[skel.line, { width: '75%', marginTop: 6 }]} />
    <View style={skel.footer}>
      <View style={[skel.line, { width: 60 }]} />
      <View style={[skel.line, { width: 80 }]} />
    </View>
  </Animated.View>
);

const skel = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.surface2,
  },
  lines: { flex: 1 },
  line: {
    height: 10,
    borderRadius: 6,
    backgroundColor: C.surface2,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.surface2,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});

const SkeletonList = ({ pulse }) => (
  <>
    {[1, 2, 3].map(i => (
      <SkeletonCard key={i} pulse={pulse} />
    ))}
  </>
);

// ─── EMPTY STATE ──────────────────────────────────────────────
const EmptyState = ({ onAction }) => (
  <View style={empty.wrap}>
    <Text style={empty.emoji}>🎨</Text>
    <Text style={empty.title}>Nenhuma avaliação ainda</Text>
    <Text style={empty.sub}>
      Após visitar um tatuador, compartilhe sua experiência para ajudar a comunidade.
    </Text>
    <TouchableOpacity style={empty.btn} onPress={onAction} activeOpacity={0.8}>
      <Text style={empty.btnText}>Explorar tatuadores</Text>
    </TouchableOpacity>
  </View>
);

const empty = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
    gap: 12,
  },
  emoji: { fontSize: 56 },
  title: {
    color: C.white,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },
  sub: {
    color: C.smoke,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  btn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: C.red,
    borderRadius: 24,
  },
  btnText: {
    color: C.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

// ─── ERROR STATE ──────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
  <View style={err.wrap}>
    <Text style={err.emoji}>⚠️</Text>
    <Text style={err.title}>Algo deu errado</Text>
    <Text style={err.msg}>{message}</Text>
    <TouchableOpacity style={err.btn} onPress={onRetry} activeOpacity={0.8}>
      <Text style={err.btnText}>Tentar novamente</Text>
    </TouchableOpacity>
  </View>
);

const err = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
    gap: 10,
  },
  emoji: { fontSize: 48 },
  title: {
    color: C.white,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4,
  },
  msg: {
    color: C.smoke,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  btn: {
    marginTop: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
  },
  btnText: {
    color: C.ash,
    fontSize: 13,
    fontWeight: '700',
  },
});

// ─── SUMMARY BAR ──────────────────────────────────────────────
const SummaryBar = ({ reviews }) => {
  if (!reviews.length) return null;
  const avg = (reviews.reduce((s, r) => s + r.nota, 0) / reviews.length).toFixed(1);
  return (
    <View style={sum.wrap}>
      <View style={sum.pill}>
        <Text style={sum.star}>★</Text>
        <Text style={sum.avg}>{avg}</Text>
        <Text style={sum.count}>média · {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}</Text>
      </View>
    </View>
  );
};

const sum = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  star:  { color: '#facc15', fontSize: 16 },
  avg:   { color: C.white,  fontSize: 18, fontWeight: '800' },
  count: { color: C.smoke,  fontSize: 12 },
});

// ─── SCREEN ───────────────────────────────────────────────────
export default function MyReviewsScreen({ navigation, route }) {
  const token = route?.params?.token ?? null; // token vindo do contexto de auth

  const [reviews,     setReviews]     = useState([]);
  const [status,      setStatus]      = useState('loading'); // 'loading' | 'success' | 'error' | 'empty'
  const [refreshing,  setRefreshing]  = useState(false);
  const [errorMsg,    setErrorMsg]    = useState('');

  // Skeleton pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.35, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ]),
    );
    if (status === 'loading') loop.start();
    else loop.stop();
    return () => loop.stop();
  }, [status]);

  // ── Fetch ────────────────────────────────────────────────────
  const load = useCallback(async (silent = false) => {
    if (!silent) setStatus('loading');
    setErrorMsg('');

    try {
      const data = await fetchMinhasAvaliacoes(token);
      setReviews(data);
      setStatus(data.length === 0 ? 'empty' : 'success');
    } catch (e) {
      setErrorMsg(e?.message ?? 'Erro inesperado.');
      setStatus('error');
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // ── Pull-to-refresh ──────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }, [load]);

  // ── Navigation ───────────────────────────────────────────────
  const handleViewProfile = useCallback((review) => {
    navigation?.navigate('ArtistProfile', { tatuadorId: review.tatuador?.id });
  }, [navigation]);

  const handleExplore = useCallback(() => {
    navigation?.navigate('Explorar');
  }, [navigation]);

  // ── Render item ──────────────────────────────────────────────
  const renderItem = useCallback(({ item }) => (
    <ReviewCard item={item} onViewProfile={handleViewProfile} />
  ), [handleViewProfile]);

  const keyExtractor = useCallback((item) => String(item.id), []);

  // ── List header ──────────────────────────────────────────────
  const ListHeader = useCallback(() => (
    <SummaryBar reviews={reviews} />
  ), [reviews]);

  // ── Render ───────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── HEADER ───────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Minhas Avaliações</Text>
          {status === 'success' && (
            <Text style={styles.headerCount}>
              {reviews.length} {reviews.length === 1 ? 'registro' : 'registros'}
            </Text>
          )}
        </View>

        {/* Placeholder para simetria visual */}
        <View style={styles.backBtn} />
      </View>

      <View style={styles.divider} />

      {/* ── CONTENT ──────────────────────────────────────── */}
      {status === 'loading' && (
        <View style={styles.listPadding}>
          <SkeletonList pulse={pulseAnim} />
        </View>
      )}

      {status === 'error' && (
        <ErrorState message={errorMsg} onRetry={load} />
      )}

      {status === 'empty' && (
        <EmptyState onAction={handleExplore} />
      )}

      {status === 'success' && (
        <FlatList
          data={reviews}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={C.red}
              colors={[C.red]}
              progressBackgroundColor={C.surface}
            />
          }
          ItemSeparatorComponent={null}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={10}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      )}
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── Header ──────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: C.white,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '300',
    marginTop: -2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: C.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerCount: {
    color: C.smoke,
    fontSize: 11,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
  },

  // ── List ────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  listPadding: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});