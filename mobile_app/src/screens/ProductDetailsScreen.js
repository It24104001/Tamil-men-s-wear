import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, StatusBar, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { t } from '../utils/i18n';
import api from '../api/api';

export default function ProductDetailsScreen({ route, navigation }) {
  const { product } = route.params;
  const dispatch = useDispatch();
  const { user, language } = useSelector(state => state.auth);
  const userProfile = user?.bodyProfile;
  const [selectedSize, setSelectedSize] = useState(product.sizeAvailable?.[0] || 'M');
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('5');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/${product._id}`);
      setReviews(res.data);
    } catch(err) {
      console.log('Error fetching reviews', err);
    }
  };

  const submitReview = async () => {
    if(!user) return Alert.alert('Error', 'Please login to review');
    try {
      await api.post('/reviews', { userId: user._id || user.id, productId: product._id, rating: Number(rating), comment: reviewText });
      setReviewText('');
      fetchReviews();
      Alert.alert('Success', 'Review added!');
    } catch(err) {
      Alert.alert('Error', 'Could not submit review');
    }
  };

  const getSmartSize = () => {
    if (!userProfile?.height || !userProfile?.weight) return null;
    const { height, weight } = userProfile;
    if (height > 180 && weight > 80) return 'XL';
    if (height > 175 && weight > 70) return 'L';
    if (height > 165 && weight > 60) return 'M';
    return 'S';
  };

  const recommendedSize = getSmartSize();

  const handleAddToCart = async () => {
    dispatch(addToCart({ ...product, selectedSize })); // Sync Local
    try {
      if(user) await api.post('/cart/add', { userId: user._id || user.id, productId: product._id, quantity: 1 });
    } catch (e) { console.log('Server cart sync issue'); }
    Alert.alert('Added to Cart', `${product.name} size ${selectedSize} added to your cart.`);
  };

  const handleWishlist = async () => {
    if(!user) return Alert.alert('Error', 'Please login first');
    try {
      await api.post('/wishlist/add', { userId: user._id || user.id, productId: product._id });
      Alert.alert('Wishlist', 'Item successfully added to your wishlist!');
    } catch(err) {
      Alert.alert('Wishlist', 'Item might already be in your wishlist!');
    }
  };

  return (
    <LinearGradient colors={['#0a0a0a', '#171300']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView>
        <Image source={{ uri: product.images?.[0] || product.image || 'https://via.placeholder.com/300' }} style={styles.image} />
        <LinearGradient colors={['transparent', '#0a0a0a']} style={styles.imageOverlay} />
        
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{product.name}</Text>
            <TouchableOpacity onPress={handleWishlist}>
              <Text style={styles.heartIcon}>❤️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.price}>Rs. {product.price}</Text>

          <Text style={styles.sectionTitle}>{t(language, 'selectSize').toUpperCase()}</Text>
          <View style={styles.sizeContainer}>
            {(product.sizeAvailable || product.sizes || ['S','M','L']).map(size => (
              <TouchableOpacity 
                key={size} 
                style={[styles.sizeBtn, selectedSize === size && styles.selectedSizeBtn]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[styles.sizeText, selectedSize === size && styles.selectedSizeText]}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {recommendedSize && (
            <Text style={styles.smartSize}>{t(language, 'smartRec')} {recommendedSize}</Text>
          )}

          <Text style={styles.description}>{product.description}</Text>

          <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
            <Text style={styles.addBtnText}>{t(language, 'addToCart').toUpperCase()}</Text>
          </TouchableOpacity>

          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>REVIEWS ({reviews.length})</Text>
            {reviews.map(r => (
              <View key={r._id} style={styles.reviewCard}>
                <Text style={styles.reviewUser}>{'⭐'.repeat(r.rating)} - {r.userId?.name || 'User'}</Text>
                <Text style={styles.reviewText}>{r.comment}</Text>
              </View>
            ))}
            
            <Text style={[styles.sectionTitle, {marginTop: 20}]}>WRITE A REVIEW</Text>
            <View style={{flexDirection: 'row', gap: 10}}>
              <TextInput style={styles.ratingInput} placeholder="Rating 1-5" placeholderTextColor="#888" keyboardType="numeric" value={rating} onChangeText={setRating} />
              <TextInput style={styles.reviewInput} placeholder="Comment..." placeholderTextColor="#888" value={reviewText} onChangeText={setReviewText} />
            </View>
            <TouchableOpacity style={styles.reviewBtn} onPress={submitReview}>
              <Text style={styles.reviewBtnText}>SUBMIT REVIEW</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: '100%', height: 450, resizeMode: 'cover' },
  imageOverlay: { position: 'absolute', top: 350, height: 100, width: '100%' },
  infoContainer: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 26, fontWeight: '900', color: '#fff', flex: 1, paddingRight: 10 },
  heartIcon: { fontSize: 26 },
  price: { fontSize: 22, color: '#FFD700', fontWeight: 'bold', marginVertical: 10 },
  sectionTitle: { color: '#FFD700', fontSize: 13, marginTop: 25, marginBottom: 10, letterSpacing: 1 },
  sizeContainer: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  sizeBtn: { padding: 12, borderWidth: 1, borderColor: '#FFD700', borderRadius: 4, width: 60, alignItems: 'center' },
  selectedSizeBtn: { backgroundColor: '#FFD700' },
  sizeText: { color: '#FFD700', fontWeight: 'bold' },
  selectedSizeText: { color: '#000', fontWeight: '900' },
  smartSize: { marginTop: 15, color: '#FFD700', fontStyle: 'italic', backgroundColor: 'rgba(255,215,0,0.1)', padding: 10, borderRadius: 4, borderWidth: 1, borderColor: '#FFD700' },
  description: { color: '#aaa', marginTop: 25, lineHeight: 24, fontSize: 15 },
  addBtn: { backgroundColor: '#FFD700', padding: 18, borderRadius: 4, alignItems: 'center', marginTop: 40, shadowColor: '#FFD700', shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  addBtnText: { color: '#000', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  reviewSection: { marginTop: 40, borderTopWidth: 1, borderColor: '#332b00', paddingTop: 20 },
  reviewCard: { backgroundColor: 'rgba(255,215,0,0.05)', padding: 15, borderRadius: 4, marginBottom: 10, borderWidth: 1, borderColor: '#332b00' },
  reviewUser: { color: '#FFD700', fontWeight: 'bold', marginBottom: 5 },
  reviewText: { color: '#ddd' },
  reviewInput: { flex: 1, backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 4, borderWidth: 1, borderColor: '#FFD700' },
  ratingInput: { width: 80, backgroundColor: '#111', color: '#fff', padding: 12, borderRadius: 4, borderWidth: 1, borderColor: '#FFD700', textAlign: 'center' },
  reviewBtn: { backgroundColor: '#332b00', padding: 15, borderRadius: 4, alignItems: 'center', marginTop: 10 },
  reviewBtnText: { color: '#FFD700', fontWeight: 'bold', letterSpacing: 1 }
});
