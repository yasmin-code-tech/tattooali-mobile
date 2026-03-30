import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Navbar from '../components/Navbar';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ARTISTS = [
  {
    id: '1',
    name: 'Rafael Ink',
    styles: ['Realismo', 'Blackwork'],
    address: 'Rua Augusta, 1420 — Consolação, São Paulo/SP',
    avg_rating: 5,
    avatar: '🎨',
    bio: 'Especialista em realismo com mais de 10 anos de experiência. Cada peça é única e produzida com máxima atenção aos detalhes.',
    gallery: ['🦅', '🐺', '🌊', '💀', '🌸'],
    comments: [
      { id: 'c1', author: 'Lucas M.', text: 'Trabalho incrível, superou minhas expectativas!', rating: 5 },
      { id: 'c2', author: 'Ana P.',  text: 'Profissional excelente, muito cuidadoso com higiene.', rating: 5 },
      { id: 'c3', author: 'Thiago R.', text: 'Realismo absurdo. Vou voltar com certeza.', rating: 5 },
    ],
  },
  {
    id: '2',
    name: 'Marina Bones',
    styles: ['Old School', 'Neotradicional'],
    address: 'Av. Paulista, 900 — Bela Vista, São Paulo/SP',
    avg_rating: 4,
    avatar: '🖋️',
    bio: 'Apaixonada por Old School e traços neotradicional. Estúdio aconchegante com atendimento personalizado.',
    gallery: ['🌹', '⚓', '🦊', '🌙', '🔥'],
    comments: [
      { id: 'c1', author: 'Fernanda L.', text: 'Amei o traço, exatamente o que eu queria!', rating: 5 },
      { id: 'c2', author: 'Bruno S.',    text: 'Atendimento ótimo e resultado perfeito.', rating: 4 },
      { id: 'c3', author: 'Camila T.',   text: 'Super recomendo, ambiente muito limpo.', rating: 4 },
    ],
  },
  {
    id: '3',
    name: 'Tiago Dark Art',
    styles: ['Geométrico', 'Minimalista'],
    address: 'Rua Oscar Freire, 340 — Jardins, São Paulo/SP',
    avg_rating: 5,
    avatar: '✏️',
    bio: 'Criador de geometrias precisas e designs minimalistas com conceito. Cada tattoo é uma obra de arte geométrica.',
    gallery: ['🔷', '🌀', '⬡', '◈', '🔺'],
    comments: [
      { id: 'c1', author: 'Pedro H.',   text: 'Precisão impecável, traço perfeito!', rating: 5 },
      { id: 'c2', author: 'Juliana K.', text: 'Minimalismo com muito estilo. Amei!', rating: 5 },
      { id: 'c3', author: 'Diego F.',   text: 'Profissional incrível, muito atencioso.', rating: 4 },
    ],
  },
];

const STYLES_FILTER = ['Todos', 'Realismo', 'Old School', 'Minimalista', 'Blackwork', 'Aquarela', 'Geométrico'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderStars(rating, size = 13) {
  const full  = Math.floor(rating);
  const empty = 5 - full;
  return (
    <Text style={[styles.stars, { fontSize: size }]}>
      {'★'.repeat(full)}
      <Text style={styles.starsEmpty}>{'☆'.repeat(empty)}</Text>
    </Text>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ArtistCard({ artist, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardImg}>
        <Text style={styles.cardImgEmoji}>{artist.avatar}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{artist.name}</Text>
        <Text style={styles.cardStyles}>{artist.styles.join(' · ').toUpperCase()}</Text>
        {renderStars(artist.avg_rating)}
        <Text style={styles.cardAddress} numberOfLines={2}>📍 {artist.address}</Text>
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.btnPrimary} onPress={onPress} activeOpacity={0.85}>
            <Text style={styles.btnPrimaryText}>Ver perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function GalleryItem({ emoji }) {
  return (
    <View style={styles.galleryItem}>
      <Text style={styles.galleryEmoji}>{emoji}</Text>
    </View>
  );
}

function CommentCard({ comment }) {
  return (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>{comment.author[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.commentAuthor}>{comment.author}</Text>
          {renderStars(comment.rating, 11)}
        </View>
      </View>
      <Text style={styles.commentText}>{comment.text}</Text>
    </View>
  );
}

function ArtistModal({ artist, visible, onClose, onReport }) {
  if (!artist) return null;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
                <View style={styles.modalAvatar}>
                  <Text style={styles.modalAvatarEmoji}>{artist.avatar}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.modalName}>{artist.name}</Text>
                  <Text style={styles.modalStyles}>{artist.styles.join(' · ').toUpperCase()}</Text>
                  {renderStars(artist.avg_rating, 15)}
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalReportBtn}
                onPress={onReport}
                activeOpacity={0.7}
              >
                <Ionicons name="flag-outline" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Address */}
            <View style={styles.modalInfoRow}>
              <Text style={styles.modalInfoIcon}>📍</Text>
              <Text style={styles.modalInfoText}>{artist.address}</Text>
            </View>

            {/* Bio */}
            <Text style={styles.modalBio}>{artist.bio}</Text>

            {/* Gallery */}
            <Text style={styles.modalSectionTitle}>GALERIA</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryRow}
            >
              {artist.gallery.map((emoji, i) => (
                <GalleryItem key={i} emoji={emoji} />
              ))}
            </ScrollView>

            {/* Comments */}
            <Text style={styles.modalSectionTitle}>AVALIAÇÕES</Text>
            {artist.comments.map(c => (
              <CommentCard key={c.id} comment={c} />
            ))}

            <TouchableOpacity style={styles.modalBtnOutline} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.modalBtnOutlineText}>Fechar</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SkeletonCard() {
  return (
    <View style={[styles.card, { opacity: 0.35 }]}>
      <View style={[styles.cardImg, { backgroundColor: '#1c1c1c' }]} />
      <View style={styles.cardBody}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '60%', marginTop: 6 }]} />
        <View style={[styles.skeletonLine, { width: '40%', marginTop: 6 }]} />
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function BuscaScreen() {
  const navigation = useNavigation();
  const [query, setQuery]               = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [loading, setLoading]           = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [modalVisible, setModalVisible]     = useState(false);
  const debounceRef = useRef(null);

  const filteredArtists = MOCK_ARTISTS.filter(a => {
    const matchQuery = query.trim() === ''
      || a.name.toLowerCase().includes(query.toLowerCase())
      || a.address.toLowerCase().includes(query.toLowerCase())
      || a.styles.some(s => s.toLowerCase().includes(query.toLowerCase()));
    const matchFilter = activeFilter === 'Todos'
      || a.styles.some(s => s.toLowerCase() === activeFilter.toLowerCase());
    return matchQuery && matchFilter;
  });

  function handleQueryChange(text) {
    setQuery(text);
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setLoading(false), 400);
  }

  function handleCardPress(artist) {
    setSelectedArtist(artist);
    setModalVisible(true);
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={loading ? [] : filteredArtists}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Hero */}
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>{'ENCONTRE\nSEU ARTISTA'}</Text>
              <Text style={styles.heroSub}>Busque tatuadores por nome, bairro ou estilo</Text>

              <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar tatuador, estilo, bairro..."
                  placeholderTextColor="#555"
                  value={query}
                  onChangeText={handleQueryChange}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersRow}
              >
                {STYLES_FILTER.map(style => (
                  <TouchableOpacity
                    key={style}
                    style={[styles.filterChip, activeFilter === style && styles.filterChipActive]}
                    onPress={() => setActiveFilter(style)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, activeFilter === style && styles.filterChipTextActive]}>
                      {style}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.sectionTitle}>
              {query || activeFilter !== 'Todos' ? 'RESULTADOS' : 'DESTAQUES'}
            </Text>

            {loading && (
              <View style={styles.skeletonList}>
                <SkeletonCard /><SkeletonCard /><SkeletonCard />
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Nenhum tatuador encontrado</Text>
              <Text style={styles.emptySub}>Tente outro nome ou estilo</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) =>
          !loading ? (
            <ArtistCard artist={item} onPress={() => handleCardPress(item)} />
          ) : null
        }
      />

      <ArtistModal
        artist={selectedArtist}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onReport={() => {
          setModalVisible(false);
          navigation.navigate('Report', {
            denunciado: selectedArtist?.name
          });
        }}
      />

      <Navbar />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const colors = {
  bg:       '#0a0a0a',
  surface:  '#141414',
  surface2: '#1c1c1c',
  surface3: '#242424',
  border:   '#2a2a2a',
  red:      '#e53030',
  text:     '#f0f0f0',
  text2:    '#888888',
  text3:    '#555555',
  gold:     '#fbbf24',
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  listContent: {
    paddingBottom: 100,
  },

  // ── Hero
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

  // ── Search bar
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
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    backgroundColor: 'transparent',
  },

  // ── Filters
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

  // ── Section title
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

  // ── Artist card
  card: {
    flexDirection: 'row',
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
    backgroundColor: colors.surface3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  cardImgEmoji: {
    fontSize: 36,
  },
  cardBody: {
    flex: 1,
    padding: 14,
    gap: 3,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  cardStyles: {
    fontSize: 10,
    color: colors.red,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardAddress: {
    fontSize: 11,
    color: colors.text3,
    marginTop: 2,
    lineHeight: 16,
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: 'row',
  },

  // ── Stars
  stars: {
    color: colors.gold,
    letterSpacing: 1,
  },
  starsEmpty: {
    color: colors.border,
  },

  // ── Primary button
  btnPrimary: {
    backgroundColor: colors.red,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Skeleton
  skeletonList: { gap: 12, paddingHorizontal: 20 },
  skeletonLine: {
    height: 12,
    width: '80%',
    backgroundColor: colors.surface2,
    borderRadius: 6,
  },

  // ── Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon:  { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 6 },
  emptySub:   { fontSize: 13, color: colors.text3, textAlign: 'center' },

  // ── Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '92%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  modalScroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    gap: 14,
  },

  // ── Modal — header
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalReportBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },
  modalReportBtnText: {
    fontSize: 16,
  },
  modalAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface3,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarEmoji: {
    fontSize: 32,
  },
  modalName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
  modalStyles: {
    fontSize: 11,
    color: colors.red,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  // ── Modal — info row
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
  },
  modalInfoIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  modalInfoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text2,
    lineHeight: 20,
  },

  // ── Modal — bio
  modalBio: {
    fontSize: 13,
    color: colors.text2,
    lineHeight: 21,
  },

  // ── Modal — section title
  modalSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text3,
    textTransform: 'uppercase',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: 4,
  },

  // ── Gallery
  galleryRow: {
    gap: 10,
    paddingBottom: 4,
  },
  galleryItem: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: colors.surface3,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryEmoji: {
    fontSize: 36,
  },

  // ── Comment card
  commentCard: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface3,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text2,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: colors.text2,
    lineHeight: 20,
  },

  // ── Modal — CTAs
  modalBtnPrimary: {
    backgroundColor: colors.red,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  modalBtnPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  modalBtnOutline: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalBtnOutlineText: {
    color: colors.text2,
    fontSize: 14,
    fontWeight: '600',
  },
});