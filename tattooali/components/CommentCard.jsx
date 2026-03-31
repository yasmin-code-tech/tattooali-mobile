


import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

const renderStars = (rating, size = 11) => {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return (
    <Text style={[styles.stars, { fontSize: size }]}>
      {'★'.repeat(full)}
      <Text style={styles.starsEmpty}>{'☆'.repeat(empty)}</Text>
    </Text>
  );
};

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

const styles = StyleSheet.create({
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
  stars: {
    color: '#FFD700',
  },
  starsEmpty: {
    color: colors.textSecondary || '#cccccc',
  },
});

export default CommentCard;