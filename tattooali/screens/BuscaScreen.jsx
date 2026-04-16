import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import Navbar from '../components/Navbar';
import { ArtistModal } from '../components/ArtistModal';
import SearchFilterModal from '../components/SearchFilterModal';
import ArtistCard from '../components/ArtistCard';
import { useAuth } from '../context/AuthContext';
import {
  buscarTatuadores,
  buscarCatalogoEstilos,
  mapBuscaToArtist,
  fetchTatuadorDetalhes,
} from '../services/tatuadorService';
import { colors } from '../theme';

const STYLES_FALLBACK = [
  'Todos',
  'Realismo',
  'Old School',
  'Minimalista',
  'Blackwork',
  'Aquarela',
  'Geométrico',
];

function SkeletonCard() {
  return (
    <View style={[styles.card, { opacity: 0.35 }]}>
      <View style={[styles.cardImg, { backgroundColor: '#1c1c1c' }]} />
      <View style={styles.cardBody}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '60%', marginTop: 6 }]} />
        <View style={[styles.skeletonLine, { width: '40%', marginTop: 6 }]} />
        <View style={styles.cardLocationRow}>
          <View style={[styles.cardLocationTexts, { gap: 6 }]}>
            <View style={[styles.skeletonLine, { width: '100%' }]} />
            <View style={[styles.skeletonLine, { width: '75%' }]} />
          </View>
          <View style={styles.skeletonBtnPlaceholder} />
        </View>
      </View>
    </View>
  );
}

export default function BuscaScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [styleChips, setStyleChips] = useState(STYLES_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [artists, setArtists] = useState([]);
  const [modalArtist, setModalArtist] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoadingDetail, setModalLoadingDetail] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedBairro, setAppliedBairro] = useState(null);
  const [appliedStars, setAppliedStars] = useState(null);

  const { user } = useAuth();
  const meUserId = Number(user?.user_id);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 450);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await buscarCatalogoEstilos();
        const names = Array.isArray(rows) ? rows.map((r) => r.nome).filter(Boolean) : [];
        if (cancelled) return;
        if (names.length > 0) {
          names.sort((a, b) => a.localeCompare(b, 'pt'));
          setStyleChips(['Todos', ...names]);
        } else {
          setStyleChips(STYLES_FALLBACK);
        }
      } catch {
        if (!cancelled) setStyleChips(STYLES_FALLBACK);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeFilter !== 'Todos' && !styleChips.includes(activeFilter)) {
      setActiveFilter('Todos');
    }
  }, [styleChips, activeFilter]);

  const loadArtists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await buscarTatuadores(debouncedQuery, activeFilter);
      const list = Array.isArray(raw)
        ? raw
            .map(mapBuscaToArtist)
            .filter(
              (a) =>
                a.user_id != null &&
                Number.isFinite(a.user_id) &&
                a.user_id >= 1 &&
                !(Number.isFinite(meUserId) && meUserId >= 1 && a.user_id === meUserId),
            )
        : [];
      setArtists(list);
    } catch (e) {
      const msg = String(e?.message || '');
      setError(
        /login|Token|401|403|autentic/i.test(msg)
          ? 'Faça login para buscar tatuadores.'
          : msg || 'Não foi possível carregar os tatuadores.',
      );
      setArtists([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedQuery, activeFilter, meUserId]);

  useEffect(() => {
    loadArtists();
  }, [loadArtists]);

  const filteredArtists = useMemo(() => {
    return artists.filter((a) => {
      const b = appliedBairro ? String(appliedBairro).trim().toLowerCase() : '';
      const matchBairro =
        !b ||
        (a.bairro && String(a.bairro).toLowerCase().includes(b)) ||
        (a.address && String(a.address).toLowerCase().includes(b));
      const matchStars = !appliedStars || (a.avg_rating || 0) >= appliedStars;
      return matchBairro && matchStars;
    });
  }, [artists, appliedBairro, appliedStars]);

  async function onRefresh() {
    setRefreshing(true);
    await loadArtists();
  }

  async function handleCardPress(artist) {
    const uid =
      artist.user_id != null && Number.isFinite(artist.user_id)
        ? artist.user_id
        : Number.parseInt(String(artist.id), 10);
    if (!Number.isFinite(uid) || uid < 1) {
      setModalArtist({ ...artist });
      setModalVisible(true);
      setModalLoadingDetail(false);
      return;
    }
    setModalArtist({ ...artist, user_id: uid });
    setModalVisible(true);
    setModalLoadingDetail(true);
    try {
      const detail = await fetchTatuadorDetalhes(uid);
      setModalArtist((prev) =>
        prev
          ? {
              ...prev,
              name: detail.name,
              styles: detail.styles,
              bairro: detail.bairro ?? prev.bairro,
              address: detail.address,
              avg_rating: detail.avg_rating,
              avatar: detail.avatar || prev.avatar,
              bio: detail.bio,
              gallery: detail.gallery,
              comments: detail.comments,
            }
          : prev,
      );
    } catch {
      /* mantém dados da lista */
    } finally {
      setModalLoadingDetail(false);
    }
  }

  function handleCloseModal() {
    setModalVisible(false);
    setModalArtist(null);
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={loading ? [] : filteredArtists}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.red} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>{'ENCONTRE\nSEU ARTISTA'}</Text>
              <Text style={styles.heroSub}>
                Busque por nome, bio, endereço ou bairro (API). Use o filtro para bairro de Fortaleza e
                nota mínima.
              </Text>

              {error ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.searchBar}>
                <Ionicons name="search" size={16} color="#fff" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar tatuador, estilo, bairro..."
                  placeholderTextColor="#555"
                  value={query}
                  onChangeText={setQuery}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setFilterModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="filter" size={16} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersRow}
              >
                {styleChips.map((style) => (
                  <TouchableOpacity
                    key={style}
                    style={[styles.filterChip, activeFilter === style && styles.filterChipActive]}
                    onPress={() => setActiveFilter(style)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.filterChipText, activeFilter === style && styles.filterChipTextActive]}
                    >
                      {style}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.sectionTitle}>
              {debouncedQuery || activeFilter !== 'Todos' ? 'RESULTADOS' : 'TATUADORES'}
            </Text>

            {loading && (
              <View style={styles.skeletonList}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>
                {error ? 'Não foi possível listar' : 'Nenhum tatuador encontrado'}
              </Text>
              <Text style={styles.emptySub}>
                {error ? 'Verifique login e conexão com o backend.' : 'Tente outro nome ou estilo'}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) =>
          !loading ? <ArtistCard artist={item} onPress={() => handleCardPress(item)} /> : null
        }
      />

      <ArtistModal
        artist={modalArtist}
        visible={modalVisible}
        onClose={handleCloseModal}
        loadingDetail={modalLoadingDetail}
        onReport={() => {
          if (!modalArtist) return;
          
          const idAlvo = modalArtist.user_id;
          const nomeAlvo = modalArtist.name;

          handleCloseModal();
          
          navigation.navigate('Report', { 
            denunciadoId: idAlvo,
            denunciadoNome: nomeAlvo,
            tipoDenunciado: 'user' // Buscando artistas sempre será 'user'
          });
        }}
        onOpenChat={(a) => {
          handleCloseModal();
          if (a?.user_id) {
            navigation.navigate('Chat', {
              peerAppUserId: a.user_id,
              peerName: a.name,
              peerAvatar: /^https?:\/\//i.test(String(a.avatar || '')) ? a.avatar : null,
            });
          }
        }}
      />

      <SearchFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={(f) => {
          setAppliedBairro(f.bairro);
          setAppliedStars(f.estrelas);
        }}
        onReset={() => {
          setAppliedBairro(null);
          setAppliedStars(null);
        }}
      />

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  listContent: {
    paddingBottom: 100,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
    backgroundColor: colors.bg,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text,
    lineHeight: 40,
    marginBottom: 4,
  },
  heroSub: {
    color: colors.text2,
    fontSize: 13,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  filterButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.surface3,
  },
  errorBanner: {
    backgroundColor: 'rgba(229,48,48,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(229,48,48,0.35)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#f87171',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  filtersRow: {
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  filterChipText: {
    color: colors.text2,
    fontSize: 12,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text3,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    textTransform: 'uppercase',
  },
  skeletonList: { gap: 12, paddingHorizontal: 20 },
  skeletonLine: {
    height: 12,
    width: '80%',
    backgroundColor: colors.surface2,
    borderRadius: 6,
  },
  skeletonBtnPlaceholder: {
    width: 92,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surface2,
    flexShrink: 0,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  cardImg: {
    width: 100,
    minHeight: 104,
    backgroundColor: colors.surface3,
  },
  cardBody: {
    flex: 1,
    padding: 14,
    gap: 3,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  cardLocationTexts: {
    flex: 1,
    minWidth: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 6 },
  emptySub: { fontSize: 13, color: colors.text3, textAlign: 'center' },
});