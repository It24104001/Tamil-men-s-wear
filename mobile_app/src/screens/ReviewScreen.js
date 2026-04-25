import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import api from '../api/api';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function ReviewScreen({ route, navigation }) {
  const { product, existingReview } = route.params || {};
  const { user } = useSelector(s => s.auth);

  const [rating,    setRating]    = useState(existingReview?.rating || 0);
  const [comment,   setComment]   = useState(existingReview?.comment || '');
  const [reviews,   setReviews]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [submitting,setSubmitting]= useState(false);
  const [editMode,  setEditMode]  = useState(!!existingReview);
  const [myReview,  setMyReview]  = useState(existingReview || null);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reviews/product/${product._id}`);
      setReviews(res.data);
      const mine = res.data.find(r => r.userId?._id === user?.id || r.userId === user?.id);
      if (mine) { setMyReview(mine); setRating(mine.rating); setComment(mine.comment); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!rating) { Alert.alert('Please select a rating'); return; }
    if (comment.trim().length < 5) { Alert.alert('Please write at least 5 characters'); return; }
    try {
      setSubmitting(true);
      if (myReview) {
        await api.put(`/reviews/${myReview._id}`, { rating, comment });
      } else {
        await api.post('/reviews', { productId: product._id, rating, comment });
      }
      Alert.alert('Success! 🎉', myReview ? 'Review updated.' : 'Review submitted. Thank you!');
      fetchReviews();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.msg || 'Could not submit review');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    Alert.alert('Delete Review', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/reviews/${myReview._id}`);
            setMyReview(null); setRating(0); setComment('');
            fetchReviews();
          } catch (e) { Alert.alert('Error', 'Could not delete review'); }
        }
      }
    ]);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={22} color="#FFD700" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Reviews</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{product?.name}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Rating Summary */}
        <LinearGradient colors={['#141414', '#1E1E1E']} style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.avgRating}>{avgRating}</Text>
            <View style={styles.starsRow}>
              {[1,2,3,4,5].map(s => (
                <Icon key={s} name="star" size={16}
                  color={s <= Math.round(Number(avgRating)) ? '#FFD700' : '#333'} />
              ))}
            </View>
            <Text style={styles.reviewCount}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.summaryRight}>
            {[5,4,3,2,1].map(n => {
              const count = reviews.filter(r => Math.round(r.rating) === n).length;
              const pct   = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <View key={n} style={styles.barRow}>
                  <Icon name="star" size={10} color="#FFD700" />
                  <Text style={styles.barLabel}>{n}</Text>
                  <View style={styles.bar}>
                    <View style={[styles.barFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.barCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </LinearGradient>

        {/* Write Review */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{myReview ? 'Your Review' : 'Write a Review'}</Text>
          <View style={styles.writeCard}>
            {/* Star picker */}
            <View style={styles.starPicker}>
              {[1,2,3,4,5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Icon name={s <= rating ? 'star' : 'star-outline'} size={36}
                    color={s <= rating ? '#FFD700' : '#333'} />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingLabel}>{RATING_LABELS[rating]}</Text>
            )}

            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience with this product..."
              placeholderTextColor="#555"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{comment.length}/500</Text>

            <View style={styles.actionRow}>
              {myReview && (
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                  <Icon name="trash-outline" size={18} color="#EF4444" />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.submitBtn, { flex: 1 }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <LinearGradient colors={['#FFD700', '#B8960C']} style={styles.submitGrad}>
                  {submitting
                    ? <ActivityIndicator size="small" color="#000" />
                    : <Text style={styles.submitText}>{myReview ? 'Update Review' : 'Submit Review'}</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* All Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Reviews ({reviews.length})</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#FFD700" />
          ) : reviews.length === 0 ? (
            <View style={styles.emptyReviews}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyText}>No reviews yet. Be the first!</Text>
            </View>
          ) : (
            reviews.map((rev, i) => (
              <View key={rev._id || i} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(rev.userId?.name || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewName}>{rev.userId?.name || 'User'}</Text>
                    <View style={styles.starsRow}>
                      {[1,2,3,4,5].map(s => (
                        <Icon key={s} name="star" size={11}
                          color={s <= rev.rating ? '#FFD700' : '#333'} />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
                <Text style={styles.reviewComment}>{rev.comment}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#0A0A0A' },
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16, gap: 12 },
  backBtn:        { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle:    { color: '#FFF', fontSize: 18, fontWeight: '700' },
  headerSub:      { color: '#888', fontSize: 12 },
  summaryCard:    { marginHorizontal: 16, borderRadius: 16, padding: 20, flexDirection: 'row', gap: 16, borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 8 },
  summaryLeft:    { alignItems: 'center', gap: 4 },
  avgRating:      { color: '#FFD700', fontSize: 44, fontWeight: '900' },
  starsRow:       { flexDirection: 'row', gap: 2 },
  reviewCount:    { color: '#888', fontSize: 11 },
  summaryRight:   { flex: 1, justifyContent: 'center', gap: 4 },
  barRow:         { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLabel:       { color: '#888', fontSize: 11, width: 8 },
  bar:            { flex: 1, height: 6, backgroundColor: '#2A2A2A', borderRadius: 3, overflow: 'hidden' },
  barFill:        { height: '100%', backgroundColor: '#FFD700', borderRadius: 3 },
  barCount:       { color: '#888', fontSize: 11, width: 16 },
  section:        { marginHorizontal: 16, marginBottom: 20 },
  sectionTitle:   { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  writeCard:      { backgroundColor: '#141414', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2A2A2A', gap: 12 },
  starPicker:     { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  ratingLabel:    { color: '#FFD700', textAlign: 'center', fontSize: 14, fontWeight: '600' },
  commentInput:   { backgroundColor: '#1E1E1E', color: '#FFF', borderRadius: 12, padding: 12, fontSize: 14, minHeight: 100 },
  charCount:      { color: '#555', fontSize: 11, textAlign: 'right' },
  actionRow:      { flexDirection: 'row', gap: 8 },
  deleteBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EF444420', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },
  deleteBtnText:  { color: '#EF4444', fontWeight: '600' },
  submitBtn:      { borderRadius: 12, overflow: 'hidden' },
  submitGrad:     { padding: 14, alignItems: 'center' },
  submitText:     { color: '#000', fontWeight: '700', fontSize: 15 },
  emptyReviews:   { alignItems: 'center', padding: 40 },
  emptyEmoji:     { fontSize: 40, marginBottom: 8 },
  emptyText:      { color: '#888', fontSize: 14 },
  reviewCard:     { backgroundColor: '#141414', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2A2A2A' },
  reviewHeader:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar:         { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFD70030', justifyContent: 'center', alignItems: 'center' },
  avatarText:     { color: '#FFD700', fontWeight: '700', fontSize: 16 },
  reviewName:     { color: '#FFF', fontWeight: '600', fontSize: 13 },
  reviewDate:     { color: '#555', fontSize: 11 },
  reviewComment:  { color: '#CCC', fontSize: 13, lineHeight: 20 },
});
