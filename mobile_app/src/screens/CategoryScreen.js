import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl, Dimensions,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2;

const CATEGORY_EMOJIS = {
  shirts:      '👔',
  pants:       '👖',
  suits:       '🤵',
  traditional: '🧣',
  formal:      '💼',
  casual:      '👕',
  ethnic:      '🎭',
  accessories: '👜',
  innerwear:   '🩲',
};

const CATEGORY_COLORS = {
  shirts:      ['#1a1a2e', '#16213e'],
  pants:       ['#1a2e1a', '#16311a'],
  suits:       ['#2e1a1a', '#311616'],
  traditional: ['#2e2a1a', '#312710'],
  formal:      ['#1a1a2e', '#0f0f2d'],
  casual:      ['#1a2e2e', '#0f2a2a'],
  ethnic:      ['#2e1a2e', '#271027'],
  accessories: ['#1f1a2e', '#19123a'],
  innerwear:   ['#2e1f1a', '#321712'],
};

export default function CategoryScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [counts,     setCounts]     = useState({});

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products'),
      ]);
      setCategories(catRes.data);

      // Count products per category
      const countMap = {};
      (prodRes.data || []).forEach(p => {
        const cat = p.category?.toLowerCase();
        if (cat) countMap[cat] = (countMap[cat] || 0) + 1;
      });
      setCounts(countMap);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchCategories(); };

  const renderCategory = ({ item, index }) => {
    const slug    = item.name.toLowerCase();
    const emoji   = CATEGORY_EMOJIS[slug] || '👔';
    const colors  = CATEGORY_COLORS[slug] || ['#1a1a1a', '#111'];
    const count   = counts[slug] || 0;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('Search', { category: item.name })}
        activeOpacity={0.85}
        style={styles.cardWrapper}
      >
        <LinearGradient colors={colors} style={[styles.card, { height: index % 3 === 0 ? CARD_SIZE * 1.2 : CARD_SIZE }]}>
          {/* Decorative ring */}
          <View style={styles.ring} />

          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.catName}>{item.name}</Text>
          <Text style={styles.catDesc} numberOfLines={1}>{item.description}</Text>

          {/* Product count badge */}
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count} items</Text>
          </View>

          {/* Arrow */}
          <View style={styles.arrow}>
            <Icon name="arrow-forward" size={14} color="#FFD700" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <LinearGradient colors={['#0A0A0A', '#141414']} style={styles.header}>
        <View>
          <Text style={styles.headerTa}>வகைகள்</Text>
          <Text style={styles.headerTitle}>Categories</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.searchBtn}>
          <Icon name="search" size={20} color="#FFD700" />
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 80 }} />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={i => i._id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {categories.length} Categories • {Object.values(counts).reduce((a, b) => a + b, 0)} Products
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏷️</Text>
              <Text style={styles.emptyText}>No categories available</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#0A0A0A' },
  header:         { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1E1E1E' },
  headerTa:       { color: '#FFD700', fontSize: 12, letterSpacing: 2 },
  headerTitle:    { color: '#FFF', fontSize: 28, fontWeight: '800' },
  searchBtn:      { width: 44, height: 44, backgroundColor: '#1E1E1E', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  grid:           { padding: 12 },
  row:            { gap: 12, marginBottom: 12 },
  listHeader:     { paddingVertical: 8 },
  listHeaderText: { color: '#666', fontSize: 12 },
  cardWrapper:    { flex: 1 },
  card:           { borderRadius: 20, padding: 16, justifyContent: 'flex-end', borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden', position: 'relative' },
  ring:           { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: '#FFD70020' },
  emoji:          { fontSize: 36, marginBottom: 8 },
  catName:        { color: '#FFF', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  catDesc:        { color: '#888', fontSize: 11, marginBottom: 8 },
  countBadge:     { backgroundColor: '#FFD70015', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#FFD70030' },
  countText:      { color: '#FFD700', fontSize: 10, fontWeight: '600' },
  arrow:          { position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFD70015', justifyContent: 'center', alignItems: 'center' },
  empty:          { alignItems: 'center', paddingTop: 80 },
  emptyIcon:      { fontSize: 48, marginBottom: 12 },
  emptyText:      { color: '#888', fontSize: 16 },
});
