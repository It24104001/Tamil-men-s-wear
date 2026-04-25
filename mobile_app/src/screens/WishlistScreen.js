import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import api from '../api/api';

const CATEGORY_EMOJIS = {
  shirts:'👔', pants:'👖', suits:'🤵', traditional:'🧣',
  formal:'💼', casual:'👕', ethnic:'🎭', accessories:'👜', innerwear:'🩲',
};

export default function WishlistScreen({ navigation }) {
  const [wishlist,  setWishlist]   = useState([]);
  const [loading,   setLoading]    = useState(true);
  const [refreshing,setRefreshing] = useState(false);
  const { user }   = useSelector(s => s.auth);
  const { isDark } = useSelector(s => s.theme);

  const bg     = isDark ? '#0A0A0A' : '#F5F5F5';
  const cardBg = isDark ? '#141414' : '#FFFFFF';

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get(`/wishlist/${user._id || user.id}`);
      setWishlist(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const removeItem = async (productId) => {
    Alert.alert('Remove Item', 'Remove this from your wishlist?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/wishlist/remove/${user._id || user.id}/${productId}`);
            setWishlist(wishlist.filter(i => (i.productId?._id || i.productId) !== productId));
          } catch (err) { Alert.alert('Error', 'Could not remove item'); }
        }
      }
    ]);
  };

  const moveToCart = (product) => {
    Alert.alert('Moved!', `${product.name} added to cart.`);
    // In a full implementation dispatch addToCart action here
  };

  const renderItem = ({ item }) => {
    const product = item.productId;
    if (!product || typeof product === 'string') return null;

    const emoji = CATEGORY_EMOJIS[product.category?.toLowerCase()] || '👔';

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardBg }]}
        onPress={() => navigation.navigate('ProductDetails', { product })}
        activeOpacity={0.85}
      >
        {/* Product Image Area */}
        <View style={styles.imageBox}>
          <Text style={styles.emoji}>{emoji}</Text>
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.info}>
          <Text style={[styles.name, { color: isDark ? '#FFF' : '#111' }]} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.category}>{product.category}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price?.toLocaleString()}</Text>
            {product.ratings > 0 && (
              <View style={styles.ratingBadge}>
                <Icon name="star" size={10} color="#FFD700" />
                <Text style={styles.ratingText}>{product.ratings}</Text>
              </View>
            )}
          </View>

          {/* Stock */}
          <Text style={[styles.stock, { color: product.stock > 0 ? '#22C55E' : '#EF4444' }]}>
            {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cartBtn, { opacity: product.stock > 0 ? 1 : 0.5 }]}
              onPress={() => moveToCart(product)}
              disabled={!product.stock}
            >
              <LinearGradient colors={['#FFD700', '#B8960C']} style={styles.cartBtnGrad}>
                <Icon name="cart-outline" size={14} color="#000" />
                <Text style={styles.cartBtnText}>Add to Cart</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(product._id)}>
              <Icon name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#0A0A0A','#141414'] : ['#FFF','#F5F5F5']} style={styles.header}>
        <View>
          <Text style={styles.headerTa}>என் விருப்பங்கள்</Text>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#111' }]}>
            Wishlist
          </Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: isDark ? '#1E1E1E' : '#EEE' }]}>
          <Icon name="heart" size={16} color="#EF4444" />
          <Text style={[styles.countNum, { color: isDark ? '#FFF' : '#111' }]}>{wishlist.length}</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={wishlist}
          renderItem={renderItem}
          keyExtractor={i => i._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWishlist(); }}
              tintColor="#FFD700" />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>💝</Text>
              <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : '#111' }]}>
                Wishlist is Empty
              </Text>
              <Text style={styles.emptySubtitle}>
                Save products you love to buy later
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.shopBtn}>
                <LinearGradient colors={['#FFD700', '#B8960C']} style={styles.shopBtnGrad}>
                  <Text style={styles.shopBtnText}>Explore Products</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header:         { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16 },
  headerTa:       { color: '#EF4444', fontSize: 12, letterSpacing: 1 },
  headerTitle:    { fontSize: 26, fontWeight: '800' },
  countBadge:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  countNum:       { fontSize: 16, fontWeight: '800' },
  card:           { flexDirection: 'row', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden' },
  imageBox:       { width: 110, backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  emoji:          { fontSize: 44 },
  discountBadge:  { position: 'absolute', top: 8, left: 8, backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discountText:   { color: '#FFF', fontSize: 9, fontWeight: '700' },
  info:           { flex: 1, padding: 12, gap: 4 },
  name:           { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  category:       { color: '#888', fontSize: 11, textTransform: 'capitalize' },
  priceRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price:          { color: '#FFD700', fontSize: 16, fontWeight: '800' },
  ratingBadge:    { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FFD70015', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  ratingText:     { color: '#FFD700', fontSize: 10, fontWeight: '600' },
  stock:          { fontSize: 11, fontWeight: '600' },
  actions:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  cartBtn:        { flex: 1, borderRadius: 10, overflow: 'hidden' },
  cartBtnGrad:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8 },
  cartBtnText:    { color: '#000', fontWeight: '700', fontSize: 12 },
  removeBtn:      { width: 36, height: 36, backgroundColor: '#EF444420', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  empty:          { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyEmoji:     { fontSize: 64 },
  emptyTitle:     { fontSize: 20, fontWeight: '700' },
  emptySubtitle:  { color: '#888', fontSize: 14, textAlign: 'center' },
  shopBtn:        { marginTop: 8, borderRadius: 12, overflow: 'hidden' },
  shopBtnGrad:    { paddingHorizontal: 28, paddingVertical: 14 },
  shopBtnText:    { color: '#000', fontWeight: '700', fontSize: 14 },
});
