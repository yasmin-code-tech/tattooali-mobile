import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors } from '../theme';

function isRemoteUrl(s) {
  return s && /^https?:\/\//i.test(String(s));
}

const renderStars = (rating, size = 13) => {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return (
    <Text style={[styles.stars, { fontSize: size }]}>
      {'★'.repeat(full)}
      <Text style={styles.starsEmpty}>{'☆'.repeat(empty)}</Text>
    </Text>
  );
};

function ArtistCard({ artist, onPress }) {
  const showPhoto = isRemoteUrl(artist.avatar);
  const initial = (artist.name && artist.name.charAt(0).toUpperCase()) || '🎨';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardImg}>
        {showPhoto ? (
          <Image source={{ uri: artist.avatar }} style={styles.cardImgPhoto} resizeMode="cover" />
        ) : (
          <Text style={styles.cardImgEmoji}>{initial}</Text>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{artist.name}</Text>
        <Text style={styles.cardStyles}>{artist.styles.join(' · ').toUpperCase()}</Text>
        {renderStars(artist.avg_rating || 0)}
        <View style={styles.cardLocationRow}>
          <View style={styles.cardLocationTexts}>
            <Text style={styles.cardAddress} numberOfLines={2}>
              📍 {artist.address}
            </Text>
            {artist.bairro ? (
              <Text style={styles.cardBairro} numberOfLines={1}>
                📍 Bairro: {artist.bairro}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity style={styles.btnPrimaryCompact} onPress={onPress} activeOpacity={0.85}>
            <Text style={styles.btnPrimaryText}>Ver perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardImgEmoji: {
    fontSize: 36,
  },
  cardImgPhoto: {
    ...StyleSheet.absoluteFillObject,
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
  cardBairro: {
    fontSize: 11,
    color: colors.text2,
    marginTop: 2,
    lineHeight: 16,
    fontWeight: '600',
  },
  cardAddress: {
    fontSize: 11,
    color: colors.text3,
    marginTop: 0,
    lineHeight: 16,
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
  btnPrimaryCompact: {
    backgroundColor: colors.red,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexShrink: 0,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  stars: {
    color: colors.gold,
    letterSpacing: 1,
  },
  starsEmpty: {
    color: colors.border,
  },
});

export default ArtistCard;
