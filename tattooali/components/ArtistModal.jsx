
 import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import CommentCard from './CommentCard';

const renderStars = (rating, size) => {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return (
    <Text style={[styles.stars, { fontSize: size }]}>
      {'★'.repeat(full)}
      <Text style={styles.starsEmpty}>{'☆'.repeat(empty)}</Text>
    </Text>
  );
} 

function GalleryItem({ emoji }) {
   return (
     <View style={styles.galleryItem}>
       <Text style={styles.galleryEmoji}>{emoji}</Text>
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
    borderColor: colors.red,
  },
  modalBtnOutlineText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

export function ArtistModal({ artist, visible, onClose, onReport }) {
  const navigation = useNavigation();
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

            <View style={{marginTop: 18, marginBottom: 8}}>
              <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', flexWrap: 'wrap', gap: 10}}>
                <Text style={styles.modalSectionTitle}>AVALIAÇÕES</Text>
                <TouchableOpacity 
                  style={[styles.modalBtnOutline, {paddingVertical: 8, paddingHorizontal: 16, minHeight: 36, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.red, backgroundColor: 'transparent'}]}
                  onPress={() => navigation.navigate('Review', { artist })} 
                  activeOpacity={0.85}
                >
                  <Ionicons name="add-outline" size={20} color={colors.red} style={{marginRight: 4}} />
                  <Text style={[styles.modalBtnOutlineText, {color: colors.red, fontWeight: '700'}]}>Adicionar avaliação</Text>
                </TouchableOpacity>
              </View>
              <View style={{marginTop: 10, gap: 10}}>
                {artist.comments.map(c => (
                  <CommentCard key={c.id} comment={c} />
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.modalBtnOutline} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.modalBtnOutlineText}>Fechar</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}