import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity,
  ActivityIndicator, Dimensions, Animated, StatusBar,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import api from '../api/api';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Shirts', 'Pants', 'Suits', 'Traditional', 'Formal', 'Casual', 'Ethnic', 'Accessories'];
const SORT_OPTIONS = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Top Rated'];

export default function SearchScreen() {
  const navigation = useNavigation();
  const [query,      setQuery]      = useState('');
  const [products,   setProducts]   = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [category,   setCategory]   = useState('All');
  const [sortBy,     setSortBy]     = useState('Newest');
  const [showFilter, setShowFilter] = useState(false);
  const [minPrice,   setMinPrice]   = useState('');
  const [maxPrice,   setMaxPrice]   = useState('');

  const filterAnim = useRef(new Animated.Value(0)).current;
  const inputRef   = useRef(null);

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { applyFilters(); }, [query, category, sortBy, minPrice, maxPrice, products]);

  useEffect(() => {
    Animated.timing(filterAnim, {
      toValue: showFilter ? 1 : 0, duration: 300, useNativeDriver: false,
    }).start();
  }, [showFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const applyFilters = useCallback(() => {
    let result = [...products];

    if (query.trim()) {
      result = result.filter(p =>
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.category?.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (category !== 'All') {
      result = result.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }
    if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));

    switch (sortBy) {
      case 'Price: Low to High':  result.sort((a, b) => a.price - b.price); break;
      case 'Price: High to Low':  result.sort((a, b) => b.price - a.price); break;
      case 'Top Rated':           result.sort((a, b) => (b.ratings || 0) - (a.ratings || 0)); break;
      default:                    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    setFiltered(result);
  }, [query, category, sortBy, minPrice, maxPrice, products]);

  const filterHeight = filterAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] });

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
      activeOpacity={0.85}
    >
      <View style={styles.cardImage}>
        <Text style={styles.cardEmoji}>👔</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <View style={styles.cardBottom}>
          <Text style={styles.cardPrice}>₹{item.price?.toLocaleString()}</Text>
          <View style={styles.ratingBadge}>
            <Icon name="star" size={10} color="#FFD700" />
            <Text style={styles.ratingText}>{item.ratings || '4.5'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={22} color="#FFD700" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color="#666" />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#666"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Icon name="close-circle" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => setShowFilter(!showFilter)} style={styles.filterBtn}>
          <Icon name="options" size={22} color={showFilter ? '#FFD700' : '#AAA'} />
        </TouchableOpacity>
      </View>

      {/* Filter Panel */}
      <Animated.View style={[styles.filterPanel, { height: filterHeight, overflow: 'hidden' }]}>
        <View style={styles.priceRow}>
          <TextInput
            style={styles.priceInput}
            placeholder="Min ₹"
            placeholderTextColor="#666"
            value={minPrice}
            onChangeText={setMinPrice}
            keyboardType="numeric"
          />
          <Text style={{ color: '#666' }}>—</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="Max ₹"
            placeholderTextColor="#666"
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="numeric"
          />
        </View>
        <FlatList
          horizontal
          data={SORT_OPTIONS}
          keyExtractor={i => i}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSortBy(item)}
              style={[styles.sortChip, sortBy === item && styles.sortChipActive]}
            >
              <Text style={[styles.sortChipText, sortBy === item && styles.sortChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
          style={{ marginTop: 8 }}
        />
      </Animated.View>

      {/* Category chips */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setCategory(item)}
            style={[styles.catChip, category === item && styles.catChipActive]}
          >
            <Text style={[styles.catChipText, category === item && styles.catChipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Results count */}
      <Text style={styles.resultsText}>{filtered.length} results found</Text>

      {/* Product Grid */}
      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderProduct}
          keyExtractor={i => i._id}
          numColumns={2}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          columnWrapperStyle={{ gap: 12 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubText}>Try a different search term</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#0A0A0A' },
  header:             { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, gap: 12 },
  backBtn:            { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  searchBar:          { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8 },
  searchInput:        { flex: 1, color: '#FFF', fontSize: 15 },
  filterBtn:          { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E', borderRadius: 12 },
  filterPanel:        { backgroundColor: '#141414', paddingHorizontal: 16, paddingTop: 8 },
  priceRow:           { flexDirection: 'row', alignItems: 'center', gap: 12 },
  priceInput:         { flex: 1, backgroundColor: '#1E1E1E', color: '#FFF', borderRadius: 8, padding: 8, fontSize: 13 },
  sortChip:           { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#333', marginRight: 8 },
  sortChipActive:     { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  sortChipText:       { color: '#AAA', fontSize: 12 },
  sortChipTextActive: { color: '#000', fontWeight: '700' },
  catChip:            { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#2A2A2A' },
  catChipActive:      { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  catChipText:        { color: '#AAA', fontSize: 13 },
  catChipTextActive:  { color: '#000', fontWeight: '700' },
  resultsText:        { color: '#666', fontSize: 12, paddingHorizontal: 16, marginBottom: 4 },
  card:               { flex: 1, backgroundColor: '#141414', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2A' },
  cardImage:          { height: 140, backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center' },
  cardEmoji:          { fontSize: 48 },
  cardInfo:           { padding: 10 },
  cardName:           { color: '#FFF', fontSize: 13, fontWeight: '600' },
  cardCategory:       { color: '#888', fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
  cardBottom:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  cardPrice:          { color: '#FFD700', fontWeight: '700', fontSize: 14 },
  ratingBadge:        { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#1E1E1E', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  ratingText:         { color: '#FFF', fontSize: 10 },
  empty:              { alignItems: 'center', paddingTop: 80 },
  emptyIcon:          { fontSize: 48, marginBottom: 12 },
  emptyText:          { color: '#FFF', fontSize: 18, fontWeight: '600' },
  emptySubText:       { color: '#666', fontSize: 14, marginTop: 4 },
});
