import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, StatusBar, TextInput, Animated, Platform } from 'react-native';
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

  const scrollY = useRef(new Animated.Value(0)).current;

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
    dispatch(addToCart({ ...product, selectedSize })); 
    try {
      if(user) await api.post('/cart/add', { userId: user._id || user.id, productId: product._id, quantity: 1 });
    } catch (e) { console.log('Server cart sync issue'); }
    
    if (Platform.OS === 'web') {
       window.alert(`Added ${product.name} to Cart!`);
       navigation.navigate('Cart');
    } else {
       Alert.alert('Added to Cart', `${product.name} size ${selectedSize} added to your cart.`, [
         { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
         { text: 'Keep Shopping', style: 'cancel' }
       ]);
    }
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

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Animated.View style={[styles.headerBlur, { opacity: headerOpacity }]}>
        <LinearGradient colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.7)']} style={StyleSheet.absoluteFill} />
        <Text style={styles.headerTitle}>{product.name.toUpperCase()}</Text>
      </Animated.View>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>←</Text>
      </TouchableOpacity>

      <Animated.ScrollView 
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        <Image source={{ uri: product.images?.[0] || product.image || 'https://via.placeholder.com/300' }} style={styles.image} />
        <LinearGradient colors={['transparent', '#0f0f0f']} style={styles.imageOverlay} />
        
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <View style={{flex: 1}}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.category}>{product.category.toUpperCase()}</Text>
            </View>
            <TouchableOpacity style={styles.wishBtn} onPress={handleWishlist}>
              <Text style={styles.heartIcon}>❤️</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.price}>Rs. {product.price}</Text>

          <View style={styles.divider} />

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
            <View style={styles.smartSizeCard}>
              <Text style={styles.smartSize}>{t(language, 'smartRec')} {recommendedSize}</Text>
            </View>
          )}

          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.divider} />

          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>REVIEWS ({reviews.length})</Text>
            {reviews.length === 0 ? (
              <Text style={styles.noReviews}>No reviews yet. Be the first to share your experience!</Text>
            ) : (
              reviews.map(r => (
                <View key={r._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewUser}>{r.userId?.name || 'User'}</Text>
                    <Text style={styles.rating}>{'⭐'.repeat(r.rating)}</Text>
                  </View>
                  <Text style={styles.reviewText}>{r.comment}</Text>
                </View>
              ))
            )}
            
            <View style={styles.addReviewBox}>
              <Text style={styles.sectionTitle}>WRITE A REVIEW</Text>
              <View style={styles.reviewInputs}>
                <TextInput style={styles.ratingInput} placeholder="5" placeholderTextColor="#888" keyboardType="numeric" value={rating} onChangeText={setRating} maxLength={1} />
                <TextInput style={styles.reviewInput} placeholder="Tell us what you think..." placeholderTextColor="#888" value={reviewText} onChangeText={setReviewText} multiline />
              </View>
              <TouchableOpacity style={styles.reviewBtn} onPress={submitReview}>
                <Text style={styles.reviewBtnText}>SUBMIT REVIEW</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      <LinearGradient colors={['transparent', 'rgba(15,15,15,0.8)', '#0f0f0f']} style={styles.bottomBar}>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
          <Text style={styles.addBtnText}>{t(language, 'addToCart').toUpperCase()}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  headerBlur: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, zIndex: 10, justifyContent: 'flex-end', paddingBottom: 15, alignItems: 'center' },
  headerTitle: { color: '#FFD700', fontWeight: '900', letterSpacing: 2, fontSize: 14 },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.5)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
  backBtnText: { color: '#FFD700', fontSize: 20, fontWeight: 'bold' },
  image: { width: '100%', height: 500, resizeMode: 'cover' },
  imageOverlay: { position: 'absolute', top: 300, height: 200, width: '100%' },
  infoContainer: { padding: 25, marginTop: -20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  name: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  category: { color: '#888', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginTop: 4 },
  wishBtn: { padding: 10, backgroundColor: 'rgba(255,215,0,0.05)', borderRadius: 25, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' },
  heartIcon: { fontSize: 22 },
  price: { fontSize: 24, color: '#FFD700', fontWeight: '900', marginTop: 10 },
  divider: { height: 1, backgroundColor: 'rgba(255,215,0,0.1)', marginVertical: 30 },
  sectionTitle: { color: '#FFD700', fontSize: 13, marginBottom: 15, fontWeight: '900', letterSpacing: 2 },
  sizeContainer: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  sizeBtn: { padding: 14, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)', borderRadius: 8, minWidth: 60, alignItems: 'center' },
  selectedSizeBtn: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  sizeText: { color: '#FFD700', fontWeight: 'bold' },
  selectedSizeText: { color: '#000', fontWeight: '900' },
  smartSizeCard: { marginTop: 20, backgroundColor: 'rgba(255,215,0,0.05)', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)', borderStyle: 'dashed' },
  smartSize: { color: '#FFD700', fontStyle: 'italic', fontSize: 13, fontWeight: '500' },
  description: { color: '#aaa', marginTop: 10, lineHeight: 26, fontSize: 16, letterSpacing: 0.3 },
  reviewSection: { marginTop: 10 },
  noReviews: { color: '#666', fontStyle: 'italic' },
  reviewCard: { backgroundColor: 'rgba(255,215,0,0.03)', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,215,0,0.1)' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reviewUser: { color: '#fff', fontWeight: 'bold' },
  rating: { fontSize: 12 },
  reviewText: { color: '#bbb', lineHeight: 20 },
  addReviewBox: { marginTop: 40, backgroundColor: 'rgba(255,215,0,0.05)', padding: 20, borderRadius: 12 },
  reviewInputs: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  ratingInput: { width: 50, backgroundColor: '#000', color: '#FFD700', textAlign: 'center', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)', fontWeight: 'bold' },
  reviewInput: { flex: 1, backgroundColor: '#000', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)', height: 50 },
  reviewBtn: { backgroundColor: '#FFD700', padding: 15, borderRadius: 8, alignItems: 'center' },
  reviewBtnText: { color: '#000', fontWeight: '900', letterSpacing: 1 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 25, paddingTop: 40 },
  addBtn: { backgroundColor: '#FFD700', padding: 20, borderRadius: 12, alignItems: 'center', shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 },
  addBtnText: { color: '#000', fontWeight: '900', fontSize: 18, letterSpacing: 2 }
});
