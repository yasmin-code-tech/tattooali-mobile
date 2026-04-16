import React, { useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { C, radius, spacing, typography } from '../styles/token';

// ─── HELPERS ──────────────────────────────────────────────────
const MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

function formatRelativeDate(dateStr) {
  const now    = new Date();
  const date   = new Date(dateStr);
  const diffMs = now - date;
  const diffD  = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffD === 0) return 'hoje';
  if (diffD === 1) return 'há 1 dia';
  if (diffD  <  7) return `há ${diffD} dias`;
  if (diffD  < 14) return 'há 1 semana';
  if (diffD  < 30) return `há ${Math.floor(diffD / 7)} semanas`;
  if (diffD  < 60) return 'há 1 mês';
  if (diffD < 365) return `há ${Math.floor(diffD / 30)} meses`;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// ─── STAR RATING ──────────────────────────────────────────────
const StarRating = ({ score, max = 5 }) => (
  <View style={star.row}>
    {Array.from({ length: max }, (_, i) => (
      <Text
        key={i}
        style={[star.icon, i < score ? star.filled : star.empty]}
      >
        ★
      </Text>
    ))}
    <Text style={star.label}>{score.toFixed(1)}</Text>
  </View>
);

const star = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', gap: 2 },
  icon:   { fontSize: 13 },
  filled: { color: '#facc15' },
  empty:  { color: '#303036' },
  label:  {
    fontSize: 11,
    fontWeight: '700',
    color: '#facc15',
    marginLeft: 4,
    letterSpacing: 0.2,
  },
});

// ─── AVATAR ───────────────────────────────────────────────────
const Avatar = ({ uri, name }) => {
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';
  return uri ? (
    <Image source={{ uri }} style={avatar.img} />
  ) : (
    <View style={avatar.fallback}>
      <Text style={avatar.initial}>{initial}</Text>
    </View>
  );
};

const avatar = StyleSheet.create({
  img: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.surface2,
  },
  fallback: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  initial: {
    color: C.ash,
    fontSize: 20,
    fontWeight: '700',
  },
});

// ─── SCORE BADGE ──────────────────────────────────────────────
const scoreBg = (n) => {
  if (n >= 4) return { bg: 'rgba(74,222,128,0.12)', text: '#4ade80' };
  if (n >= 3) return { bg: 'rgba(250,204,21,0.12)', text: '#facc15' };
  return          { bg: 'rgba(232,40,30,0.12)',  text: '#e8281e' };
};

// ─── REVIEW CARD ──────────────────────────────────────────────
const ReviewCard = React.memo(({ item, onViewProfile }) => {
  const { tatuador, nota, comentario, data } = item;
  const badge = scoreBg(nota);

  const handlePress = useCallback(() => {
    onViewProfile?.(item);
  }, [item, onViewProfile]);

  return (
    <View style={styles.card}>
      {/* ── Top row ──────────────────────────────────────── */}
      <View style={styles.topRow}>
        <Avatar uri={tatuador?.avatar} name={tatuador?.nome} />

        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>{tatuador?.nome ?? '—'}</Text>

          {!!tatuador?.bairro && (
            <View style={styles.locationRow}>
              <Text style={styles.locationPin}>📍</Text>
              <Text style={styles.location} numberOfLines={1}>{tatuador.bairro}</Text>
            </View>
          )}

          <StarRating score={nota ?? 0} />
        </View>

        {/* Score badge */}
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>
            {nota.toFixed(0)}
          </Text>
        </View>
      </View>

      {/* ── Divider ──────────────────────────────────────── */}
      <View style={styles.divider} />

      {/* ── Comment ──────────────────────────────────────── */}
      {!!comentario && (
        <Text style={styles.comment} numberOfLines={4}>
          "{comentario}"
        </Text>
      )}

      {/* ── Footer ───────────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={styles.date}>{formatRelativeDate(data)}</Text>

        <TouchableOpacity
          style={styles.profileBtn}
          onPress={handlePress}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={styles.profileBtnText}>Ver perfil →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

ReviewCard.displayName = 'ReviewCard';
export default ReviewCard;

// ─── STYLES ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },

  // ── Top ─────────────────────────────────────────────────────
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  meta: {
    flex: 1,
    gap: 5,
  },
  name: {
    color: C.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationPin: { fontSize: 11 },
  location: {
    color: C.smoke,
    fontSize: 12,
  },

  // ── Badge ───────────────────────────────────────────────────
  badge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '800',
  },

  // ── Divider ─────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 12,
  },

  // ── Comment ─────────────────────────────────────────────────
  comment: {
    color: C.ash,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 12,
  },

  // ── Footer ──────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    color: C.mist,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  profileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: C.surface2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  profileBtnText: {
    color: C.ash,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});