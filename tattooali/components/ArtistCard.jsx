import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

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

const styles = StyleSheet.create({
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
  stars: {
    color: colors.gold,
    letterSpacing: 1,
  },
  starsEmpty: {
    color: colors.border,
  },
});

export default ArtistCard;