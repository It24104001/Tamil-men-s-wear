import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { t } from '../utils/i18n';
import api from '../api/api';

export default function WishlistScreen({ navigation }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, language } = useSelector(state => state.auth);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/wishlist/${user._id || user.id}`);
      setWishlist(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/remove/${user._id || user.id}/${productId}`);
      setWishlist(wishlist.filter(item => item.productId?._id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  const renderItem = ({ item }) => {
    const product = item.productId;
    if (!product) return null;

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('ProductDetails', { product })}
      >
        <Image source={{ uri: product.images?.[0] || product.image || 'https://via.placeholder.com/150' }} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>Rs. {product.price}</Text>
        </View>
        <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromWishlist(product._id)}>
          <Text style={styles.removeText}>X</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#FFD700" /></View>;

  return (
    <LinearGradient colors={['#0a0a0a', '#171300']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.header}>YOUR WISHLIST</Text>
      
      {wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>YOUR WISHLIST IS EMPTY</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.shopBtnText}>CONTINUE SHOPPING</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
  header: { fontSize: 26, fontWeight: '900', color: '#FFD700', paddingHorizontal: 20, marginBottom: 20, letterSpacing: 1 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(255, 215, 0, 0.05)', 
    borderRadius: 4, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#332b00',
    alignItems: 'center',
    padding: 10
  },
  image: { width: 80, height: 80, borderRadius: 4, resizeMode: 'cover' },
  details: { flex: 1, marginLeft: 15 },
  name: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  price: { color: '#FFD700', fontSize: 18, fontWeight: '900', marginTop: 5 },
  removeBtn: { padding: 10 },
  removeText: { color: '#ff4444', fontWeight: 'bold', fontSize: 18 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: '#888', fontSize: 14, letterSpacing: 1, marginBottom: 20 },
  shopBtn: { backgroundColor: '#FFD700', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 4 },
  shopBtnText: { color: '#000', fontWeight: '900', letterSpacing: 1 }
});
