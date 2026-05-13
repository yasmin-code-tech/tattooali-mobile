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
import { ArtistModal } from '../components/ArtistModal';
import { fetchMinhasAvaliacoes } from '../services/reviewService';
import { fetchTatuadorDetalhes } from '../services/tatuadorService';

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
  topRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  avatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: C.surface2 },
  lines: { flex: 1 },
  line: { height: 10, borderRadius: 6, backgroundColor: C.surface2 },
  badge: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.surface2 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
});

const SkeletonList = ({ pulse }) => (
  <>
    {[1, 2, 3].map(i => (
      <SkeletonCard key={i} pulse={pulse} />
    ))}
  </>
);

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
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 60, gap: 12 },
  emoji: { fontSize: 56 },
  title: { color: C.white, fontSize: 18, fontWeight: '800', textAlign: 'center', marginTop: 4 },
  sub: { color: C.smoke, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  btn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: C.red, borderRadius: 24 },
  btnText: { color: C.white, fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
});

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
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 60, gap: 10 },
  emoji: { fontSize: 48 },
  title: { color: C.white, fontSize: 17, fontWeight: '800', marginTop: 4 },
  msg: { color: C.smoke, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  btn: { marginTop: 10, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
  btnText: { color: C.ash, fontSize: 13, fontWeight: '700' },
});

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
  wrap: { paddingHorizontal: 20, marginBottom: 16 },
  pill: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  star:  { color: '#facc15', fontSize: 16 },
  avg:   { color: C.white,  fontSize: 18, fontWeight: '800' },
  count: { color: C.smoke,  fontSize: 12 },
});

// --- TELA PRINCIPAL ---

export default function MyReviewsScreen({ navigation, route }) {
  const clienteId = route?.params?.clienteId ?? route?.params?.client_id ?? null;

  const [reviews,      setReviews]     = useState([]);
  const [status,       setStatus]      = useState('loading');
  const [refreshing,   setRefreshing]  = useState(false);
  const [errorMsg,     setErrorMsg]    = useState('');

  const [modalArtist, setModalArtist] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoadingDetail, setModalLoadingDetail] = useState(false);

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

  const load = useCallback(async (silent = false) => {
    if (!silent) setStatus('loading');
    setErrorMsg('');
    try {
      const data = await fetchMinhasAvaliacoes(clienteId);
      setReviews(data);
      setStatus(data.length === 0 ? 'empty' : 'success');
    } catch (e) {
      setErrorMsg(e?.message ?? 'Erro inesperado.');
      setStatus('error');
    }
  }, [clienteId]);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }, [load]);

  const handleViewProfile = useCallback(async (review) => {
    const artist = review.tatuador;
    if (!artist) return;

    const uid = artist.user_id != null && Number.isFinite(artist.user_id)
      ? artist.user_id
      : Number.parseInt(String(artist.id), 10);

    if (!Number.isFinite(uid) || uid < 1) {
      setModalArtist({ ...artist, styles: artist.styles || [] });
      setModalVisible(true);
      setModalLoadingDetail(false);
      return;
    }

    setModalArtist({ ...artist, user_id: uid, styles: artist.styles || [] });
    setModalVisible(true);
    setModalLoadingDetail(true);

    try {
      const detail = await fetchTatuadorDetalhes(uid);
      setModalArtist((prev) =>
        prev ? {
          ...prev,
          name: detail.name,
          styles: detail.styles || [], 
          address: detail.address,
          avg_rating: detail.avg_rating,
          avatar: detail.avatar || prev.avatar,
          bio: detail.bio,
          gallery: detail.gallery,
          comments: detail.comments,
        } : prev
      );
    } catch (err) {
      console.log("Erro ao carregar detalhes");
    } finally {
      setModalLoadingDetail(false);
    }
  }, []);

  const handleExplore = useCallback(() => {
    navigation?.navigate('Busca');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
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
        <View style={styles.backBtnPlaceholder} />
      </View>

      <View style={styles.divider} />

      {status === 'loading' && (
        <View style={styles.listPadding}>
          <SkeletonList pulse={pulseAnim} />
        </View>
      )}

      {status === 'error' && <ErrorState message={errorMsg} onRetry={load} />}

      {status === 'empty' && <EmptyState onAction={handleExplore} />}

      {status === 'success' && (
        <FlatList
          data={reviews}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ReviewCard item={item} onViewProfile={() => handleViewProfile(item)} />
          )}
          ListHeaderComponent={<SummaryBar reviews={reviews} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.red} />
          }
        />
      )}

      <ArtistModal
        artist={modalArtist}
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setModalArtist(null);
        }}
        loadingDetail={modalLoadingDetail}
        onReport={() => {
          if (!modalArtist) return;
          setModalVisible(false);
          navigation.navigate('Report', { 
            denunciadoId: modalArtist.user_id,
            denunciadoNome: modalArtist.name,
            tipoDenunciado: 'user'
          });
        }}
        onOpenChat={(a) => {
          setModalVisible(false);
          if (a?.user_id) {
            navigation.navigate('Chat', {
              peerAppUserId: a.user_id,
              peerName: a.name,
              peerAvatar: a.avatar
            });
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  backBtnPlaceholder: { width: 36, height: 36 },
  backText: { color: C.white, fontSize: 28, lineHeight: 32, fontWeight: '300', marginTop: -4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: C.white, fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  headerCount: { color: C.smoke, fontSize: 11, marginTop: 2 },
  divider: { height: 1, backgroundColor: C.border },
  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, flexGrow: 1 },
  listPadding: { paddingHorizontal: 20, paddingTop: 20 },
});