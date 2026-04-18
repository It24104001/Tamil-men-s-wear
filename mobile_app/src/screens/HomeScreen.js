import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, ScrollView, StatusBar } from 'react-native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { t } from '../utils/i18n';
import api from '../api/api';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  
  const { language } = useSelector(state => state.auth);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;
    if (search) {
      result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }
    setFilteredProducts(result);
  }, [search, category, products]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProductDetails', { product: item })}>
      <Image source={{ uri: item.images[0] || 'https://via.placeholder.com/150' }} style={styles.image} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.gradientOverlay}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.price}>Rs. {item.price}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const categories = ['all', 'shirts', 'pants', 'formal', 'casual', 'festival'];

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#FFD700" /></View>;

  return (
    <LinearGradient colors={['#0a0a0a', '#171300']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.header}>{t(language, 'featured').toUpperCase()}</Text>
      
      <View style={styles.searchBar}>
        <TextInput 
          style={styles.searchInput} 
          placeholder={t(language, 'search')}
          placeholderTextColor="#FFD700"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.filterBtn, category === cat && styles.filterBtnActive]} 
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.filterText, category === cat && styles.filterTextActive]}>{cat.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
  header: { fontSize: 26, fontWeight: '900', color: '#FFD700', paddingHorizontal: 20, marginBottom: 15, letterSpacing: 1 },
  searchBar: { paddingHorizontal: 20, marginBottom: 15 },
  searchInput: { backgroundColor: 'rgba(255, 215, 0, 0.05)', color: '#FFD700', padding: 12, borderRadius: 4, borderWidth: 1, borderColor: '#FFD700' },
  filtersWrapper: { paddingLeft: 20, marginBottom: 20 },
  filtersRow: { flexDirection: 'row' },
  filterBtn: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: 'transparent', borderRadius: 4, marginRight: 10, borderWidth: 1, borderColor: '#FFD700' },
  filterBtnActive: { backgroundColor: '#FFD700' },
  filterText: { color: '#FFD700', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  filterTextActive: { color: '#000' },
  list: { paddingHorizontal: 10, paddingBottom: 20 },
  card: { flex: 1, margin: 10, borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: '#332b00' },
  image: { width: '100%', height: 220, resizeMode: 'cover' },
  gradientOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, paddingTop: 30 },
  name: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  price: { color: '#FFD700', fontSize: 16, fontWeight: '900', marginTop: 2 },
});
