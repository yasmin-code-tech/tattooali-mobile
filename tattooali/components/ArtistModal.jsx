import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  InteractionManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import CommentCard from './CommentCard';

function isRemoteUrl(s) {
  return s && /^https?:\/\//i.test(String(s));
}

const renderStars = (rating, size) => {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return (
    <Text style={[styles.stars, { fontSize: size }]}>
      {'★'.repeat(full)}
      <Text style={styles.starsEmpty}>{'☆'.repeat(empty)}</Text>
    </Text>
  );
};

function GalleryItem({ uri, emoji, onPress }) {
  if (uri && isRemoteUrl(uri)) {
    return (
      <TouchableOpacity style={styles.galleryItem} onPress={() => onPress(uri)} activeOpacity={0.85}>
        <Image source={{ uri }} style={styles.galleryImage} resizeMode="cover" />
      </TouchableOpacity>
    );
  }
  return (
    <View style={styles.galleryItem}>
      <Text style={styles.galleryEmoji}>{emoji || '🖼️'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  modalLoadingBox: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  modalLoadingText: {
    color: colors.text2,
    fontSize: 13,
  },
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
  modalAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface3,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modalAvatarEmoji: {
    fontSize: 32,
  },
  modalAvatarPhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
  modalInfoLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.text3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  modalInfoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text2,
    lineHeight: 20,
  },
  modalBio: {
    fontSize: 13,
    color: colors.text2,
    lineHeight: 21,
  },
  modalChatBtn: {
    backgroundColor: colors.red,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  modalChatBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
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
  modalEmptyHint: {
    color: colors.text3,
    fontSize: 13,
    marginBottom: 8,
  },
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
    overflow: 'hidden',
  },
  galleryEmoji: {
    fontSize: 36,
  },
  galleryImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  modalBtnOutline: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.red,
  },
  modalBtnOutlineText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  stars: {
    color: colors.gold,
    letterSpacing: 1,
  },
  starsEmpty: {
    color: colors.border,
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  imageViewerImage: {
    width: '100%',
    height: '100%',
  },
});

export function ArtistModal({
  artist,
  visible,
  onClose,
  onReport,
  loadingDetail = false,
  onOpenChat,
}) {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);

  if (!artist) return null;

  const showPhoto = isRemoteUrl(artist.avatar);
  const initial = (artist.name && artist.name.charAt(0).toUpperCase()) || '🎨';
  const galleryItems = Array.isArray(artist.gallery) ? artist.gallery : [];
  const comments = Array.isArray(artist.comments) ? artist.comments : [];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
            {loadingDetail ? (
              <View style={styles.modalLoadingBox}>
                <ActivityIndicator size="large" color={colors.red} />
                <Text style={styles.modalLoadingText}>Carregando perfil…</Text>
              </View>
            ) : null}

            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
                <TouchableOpacity 
                  style={styles.modalAvatar}
                  onPress={() => showPhoto && setSelectedImage(artist.avatar)}
                  activeOpacity={showPhoto ? 0.8 : 1}
                >
                  {showPhoto ? (
                    <Image source={{ uri: artist.avatar }} style={styles.modalAvatarPhoto} resizeMode="cover" />
                  ) : (
                    <Text style={styles.modalAvatarEmoji}>{initial}</Text>
                  )}
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <Text style={styles.modalName}>{artist.name}</Text>
                  <Text style={styles.modalStyles}>{artist.styles.join(' · ').toUpperCase()}</Text>
                  {renderStars(artist.avg_rating || 0, 15)}
                </View>
              </View>

              <TouchableOpacity style={styles.modalReportBtn} onPress={onReport} activeOpacity={0.7}>
                <Ionicons name="flag-outline" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {artist.bairro ? (
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoIcon}>📌</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalInfoLabel}>Bairro</Text>
                  <Text style={styles.modalInfoText}>{artist.bairro}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.modalInfoRow}>
              <Text style={styles.modalInfoIcon}>📍</Text>
              <Text style={styles.modalInfoText}>{artist.address}</Text>
            </View>

            <Text style={styles.modalBio}>{artist.bio}</Text>

            {!loadingDetail && artist.user_id ? (
              <TouchableOpacity
                style={styles.modalChatBtn}
                onPress={() => onOpenChat?.(artist)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalChatBtnText}>Conversar</Text>
              </TouchableOpacity>
            ) : null}

            <Text style={styles.modalSectionTitle}>GALERIA</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryRow}
            >
              {galleryItems.length === 0 ? (
                <Text style={styles.modalEmptyHint}>Nenhuma foto na galeria ainda.</Text>
              ) : (
                galleryItems.map((item, i) =>
                  isRemoteUrl(item) ? (
                    <GalleryItem key={i} uri={item} onPress={setSelectedImage} />
                  ) : (
                    <GalleryItem key={i} emoji={item} />
                  ),
                )
              )}
            </ScrollView>

            <View style={{ marginTop: 18, marginBottom: 8 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <Text style={styles.modalSectionTitle}>AVALIAÇÕES</Text>
                <TouchableOpacity
                  style={[
                    styles.modalBtnOutline,
                    {
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      minHeight: 36,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: colors.red,
                      backgroundColor: 'transparent',
                    },
                  ]}
                  onPress={() => {
                    const uid =
                      artist.user_id != null && Number.isFinite(Number(artist.user_id))
                        ? Number(artist.user_id)
                        : Number.parseInt(String(artist.id), 10);
                    const artistForReview = {
                      ...artist,
                      ...(Number.isFinite(uid) && uid >= 1 ? { user_id: uid } : {}),
                    };
                    onClose();
                    InteractionManager.runAfterInteractions(() => {
                      navigation.navigate('Review', { artist: artistForReview });
                    });
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add-outline" size={20} color={colors.red} style={{ marginRight: 4 }} />
                  <Text style={[styles.modalBtnOutlineText, { color: colors.red, fontWeight: '700' }]}>
                    Adicionar avaliação
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 10, gap: 10 }}>
                {comments.length === 0 ? (
                  <Text style={styles.modalEmptyHint}>Sem avaliações públicas ainda.</Text>
                ) : (
                  comments.map((c) => <CommentCard key={c.id} comment={c} />)
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.modalBtnOutline} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.modalBtnOutlineText}>Fechar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Full-screen Image Viewer Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <TouchableOpacity 
          style={styles.imageViewerContainer}
          activeOpacity={1}
          onPress={() => setSelectedImage(null)}
        >
          <TouchableOpacity 
            style={styles.imageViewerCloseBtn} 
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }} 
              style={styles.imageViewerImage} 
              resizeMode="contain" 
            />
          )}
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
}
