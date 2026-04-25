import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView,
  RefreshControl, StatusBar, Dimensions, Animated, ActivityIndicator,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import api from '../api/api';

const { width } = Dimensions.get('window');

const CATEGORY_EMOJIS = {
  shirts:'👔', pants:'👖', suits:'🤵', traditional:'🧣',
  formal:'💼', casual:'👕', ethnic:'🎭', accessories:'👜', innerwear:'🩲',
};

// ── Skeleton loader ───────────────────────────────────────────
function SkeletonCard() {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1,   duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.skeletonCard, { opacity: pulse }]}>
      <View style={styles.skeletonImg} />
      <View style={styles.skeletonLine1} />
      <View style={styles.skeletonLine2} />
    </Animated.View>
  );
}

// ── Product Card ──────────────────────────────────────────────
function ProductCard({ item, onPress, onWishlist, isWishlisted }) {
  const discount = item.discount || 0;
  const original = discount > 0 ? Math.round(item.price / (1 - discount / 100)) : null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.productCard}>
      <View style={styles.productImageBox}>
        <Text style={styles.productEmoji}>
          {CATEGORY_EMOJIS[item.category?.toLowerCase()] || '👔'}
        </Text>
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
        {item.featured && (
          <View style={styles.featuredBadge}>
            <Icon name="star" size={8} color="#000" />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        <TouchableOpacity style={styles.wishlistBtn} onPress={onWishlist}>
          <Icon name={isWishlisted ? 'heart' : 'heart-outline'} size={16}
            color={isWishlisted ? '#EF4444' : '#FFF'} />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productCat}>{item.category}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>₹{item.price?.toLocaleString()}</Text>
          {original && <Text style={styles.originalPrice}>₹{original.toLocaleString()}</Text>}
        </View>
        {item.ratings > 0 && (
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map(s => (
              <Icon key={s} name="star" size={9}
                color={s <= Math.round(item.ratings) ? '#FFD700' : '#333'} />
            ))}
            <Text style={styles.ratingCount}>({item.ratings})</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const dispatch   = useDispatch();
  const { user }   = useSelector(s => s.auth);
  const { isDark } = useSelector(s => s.theme);
  const wishlist   = useSelector(s => s.wishlist.items);

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [featured,   setFeatured]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activecat,  setActiveCat]  = useState('All');
  const [filtered,   setFiltered]   = useState([]);

  const bg = isDark ? '#0A0A0A' : '#F5F5F5';

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    setFiltered(
      activecat === 'All'
        ? products
        : products.filter(p => p.category?.toLowerCase() === activecat.toLowerCase())
    );
  }, [activecat, products]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
      ]);
      const prods = prodRes.data || [];
      setProducts(prods);
      setFiltered(prods);
      setFeatured(prods.filter(p => p.featured || p.stock > 20).slice(0, 5));
      setCategories([{ _id: 'all', name: 'All' }, ...(catRes.data || [])]);
    } catch (e) { console.error('HomeScreen fetch error:', e.message); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const isWishlisted = (productId) =>
    wishlist.some(w => (w.productId?._id || w.productId) === productId);

  const renderHeader = () => (
    <View>
      {/* Top Bar */}
      <LinearGradient colors={isDark ? ['#0A0A0A', '#141414'] : ['#FFFFFF', '#F5F5F5']} style={styles.topBar}>
        <View>
          <Text style={[styles.greeting, { color: isDark ? '#888' : '#666' }]}>
            வணக்கம், {user?.name?.split(' ')[0] || 'Guest'} 👋
          </Text>
          <Text style={[styles.brand, { color: isDark ? '#FFD700' : '#B8960C' }]}>
            தமிழ் Men's Wear
          </Text>
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: isDark ? '#1E1E1E' : '#EEE' }]}
            onPress={() => dispatch(toggleTheme())}
          >
            <Icon name={isDark ? 'sunny-outline' : 'moon-outline'} size={20}
              color={isDark ? '#FFD700' : '#555'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: isDark ? '#1E1E1E' : '#EEE' }]}
            onPress={() => navigation.navigate('Search')}
          >
            <Icon name="search-outline" size={20} color={isDark ? '#FFF' : '#333'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: isDark ? '#1E1E1E' : '#EEE' }]}
            onPress={() => navigation.navigate('Cart')}
          >
            <Icon name="cart-outline" size={20} color={isDark ? '#FFF' : '#333'} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Hero Banner */}
      <LinearGradient colors={['#1a1200', '#2a1f00', '#1a1200']} style={styles.heroBanner}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroTag}>New Arrivals 2026</Text>
          <Text style={styles.heroTitle}>Tradition{'\n'}Meets Style</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            style={styles.heroBtn}
          >
            <LinearGradient colors={['#FFD700', '#B8960C']} style={styles.heroBtnGrad}>
              <Text style={styles.heroBtnText}>Shop Now</Text>
              <Icon name="arrow-forward" size={14} color="#000" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={styles.heroRight}>
          <Text style={styles.heroEmoji}>👔</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Up to</Text>
            <Text style={styles.heroBadgeDisc}>40% OFF</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsRow}>
        {[
          { icon: '🚚', label: 'Free Shipping', sub: 'Over ₹999' },
          { icon: '↩️', label: 'Easy Returns',  sub: '7-day returns' },
          { icon: '🔒', label: 'Secure Pay',    sub: '256-bit SSL' },
          { icon: '⭐', label: 'Earn Points',   sub: 'Every purchase' },
        ].map((s, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: isDark ? '#141414' : '#FFF' }]}>
            <Text style={styles.statEmoji}>{s.icon}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#FFF' : '#111' }]}>{s.label}</Text>
            <Text style={styles.statSub}>{s.sub}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Category Chips */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111' }]}>Categories</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
          <Text style={styles.seeAll}>See All →</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={i => i._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setActiveCat(item.name)}
            style={[
              styles.catChip,
              { backgroundColor: isDark ? '#1E1E1E' : '#EEE', borderColor: isDark ? '#2A2A2A' : '#DDD' },
              activecat === item.name && styles.catChipActive,
            ]}
          >
            {item.name !== 'All' && (
              <Text style={styles.catChipEmoji}>
                {CATEGORY_EMOJIS[item.name.toLowerCase()] || '👔'}
              </Text>
            )}
            <Text style={[
              styles.catChipText,
              { color: isDark ? '#CCC' : '#555' },
              activecat === item.name && styles.catChipTextActive,
            ]}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Featured Banner */}
      {featured.length > 0 && (
        <>
          <View style={[styles.sectionHeader, { marginTop: 16 }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111' }]}>
              ✨ Featured
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {featured.map(item => (
              <TouchableOpacity
                key={item._id}
                onPress={() => navigation.navigate('ProductDetails', { product: item })}
                activeOpacity={0.85}
                style={styles.featuredCard}
              >
                <LinearGradient colors={['#1a1200', '#2a1f00']} style={styles.featuredGrad}>
                  <Text style={styles.featuredEmoji}>
                    {CATEGORY_EMOJIS[item.category?.toLowerCase()] || '👔'}
                  </Text>
                  <View style={styles.featuredInfo}>
                    <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.featuredPrice}>₹{item.price?.toLocaleString()}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* Products Section Header */}
      <View style={[styles.sectionHeader, { marginTop: 16 }]}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111' }]}>
          All Products ({filtered.length})
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0A0A0A' : '#FFFFFF'} />

      {loading ? (
        <>
          {renderHeader()}
          <View style={styles.skeletonGrid}>
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </View>
        </>
      ) : (
        <FlatList
          data={filtered}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              onPress={() => navigation.navigate('ProductDetails', { product: item })}
              onWishlist={() => {}}
              isWishlisted={isWishlisted(item._id)}
            />
          )}
          keyExtractor={i => i._id}
          numColumns={2}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100 }}
          columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }}
              tintColor="#FFD700" />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🛍️</Text>
              <Text style={[styles.emptyText, { color: isDark ? '#888' : '#555' }]}>
                No products in this category
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  topBar:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12 },
  greeting:         { fontSize: 12 },
  brand:            { fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  topActions:       { flexDirection: 'row', gap: 8 },
  iconBtn:          { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  heroBanner:       { marginHorizontal: 16, marginVertical: 12, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
  heroLeft:         { flex: 1, gap: 8 },
  heroTag:          { color: '#FFD700', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  heroTitle:        { color: '#FFF', fontSize: 24, fontWeight: '900', lineHeight: 30 },
  heroBtn:          { alignSelf: 'flex-start' },
  heroBtnGrad:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  heroBtnText:      { color: '#000', fontWeight: '700', fontSize: 13 },
  heroRight:        { alignItems: 'center', gap: 8 },
  heroEmoji:        { fontSize: 56 },
  heroBadge:        { backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignItems: 'center' },
  heroBadgeText:    { color: '#FFF', fontSize: 9 },
  heroBadgeDisc:    { color: '#FFF', fontSize: 14, fontWeight: '900' },
  statsRow:         { paddingHorizontal: 16, paddingVertical: 8, gap: 10 },
  statCard:         { borderRadius: 12, padding: 12, alignItems: 'center', minWidth: 90, borderWidth: 1, borderColor: '#2A2A2A' },
  statEmoji:        { fontSize: 20, marginBottom: 4 },
  statLabel:        { fontSize: 11, fontWeight: '600' },
  statSub:          { fontSize: 9, color: '#888', marginTop: 2 },
  sectionHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle:     { fontSize: 17, fontWeight: '700' },
  seeAll:           { color: '#FFD700', fontSize: 13 },
  catChip:          { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  catChipActive:    { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  catChipEmoji:     { fontSize: 14 },
  catChipText:      { fontSize: 13 },
  catChipTextActive:{ color: '#000', fontWeight: '700' },
  featuredCard:     { borderRadius: 16, overflow: 'hidden', width: 160 },
  featuredGrad:     { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 16 },
  featuredEmoji:    { fontSize: 32 },
  featuredInfo:     { flex: 1 },
  featuredName:     { color: '#FFF', fontSize: 12, fontWeight: '600' },
  featuredPrice:    { color: '#FFD700', fontSize: 13, fontWeight: '700', marginTop: 2 },
  productCard:      { flex: 1, backgroundColor: '#141414', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2A' },
  productImageBox:  { height: 150, backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  productEmoji:     { fontSize: 52 },
  discountBadge:    { position: 'absolute', top: 8, left: 8, backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discountText:     { color: '#FFF', fontSize: 9, fontWeight: '700' },
  featuredBadge:    { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', gap: 3, backgroundColor: '#FFD700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignItems: 'center' },
  featuredText:     { color: '#000', fontSize: 8, fontWeight: '700' },
  wishlistBtn:      { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: '#00000060', justifyContent: 'center', alignItems: 'center' },
  productInfo:      { padding: 10 },
  productName:      { color: '#FFF', fontSize: 13, fontWeight: '600' },
  productCat:       { color: '#888', fontSize: 10, textTransform: 'capitalize', marginTop: 1 },
  priceRow:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  productPrice:     { color: '#FFD700', fontWeight: '800', fontSize: 14 },
  originalPrice:    { color: '#666', fontSize: 11, textDecorationLine: 'line-through' },
  ratingRow:        { flexDirection: 'row', alignItems: 'center', gap: 1, marginTop: 4 },
  ratingCount:      { color: '#888', fontSize: 9, marginLeft: 3 },
  skeletonGrid:     { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  skeletonCard:     { width: (width - 48) / 2, backgroundColor: '#1E1E1E', borderRadius: 16, overflow: 'hidden' },
  skeletonImg:      { height: 150, backgroundColor: '#2A2A2A' },
  skeletonLine1:    { height: 12, backgroundColor: '#2A2A2A', margin: 10, borderRadius: 6 },
  skeletonLine2:    { height: 10, backgroundColor: '#2A2A2A', marginHorizontal: 10, marginBottom: 10, borderRadius: 6, width: '60%' },
  empty:            { alignItems: 'center', paddingTop: 60 },
  emptyEmoji:       { fontSize: 48, marginBottom: 12 },
  emptyText:        { fontSize: 14 },
});
