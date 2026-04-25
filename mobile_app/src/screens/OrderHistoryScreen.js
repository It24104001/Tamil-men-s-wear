import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import api from '../api/api';

const STATUS_CONFIG = {
  'Pending':          { color: '#F59E0B', bg: '#F59E0B20', icon: 'time-outline' },
  'Confirmed':        { color: '#3B82F6', bg: '#3B82F620', icon: 'checkmark-circle-outline' },
  'Shipped':          { color: '#8B5CF6', bg: '#8B5CF620', icon: 'cube-outline' },
  'Out for Delivery': { color: '#F97316', bg: '#F9731620', icon: 'bicycle-outline' },
  'Delivered':        { color: '#22C55E', bg: '#22C55E20', icon: 'checkmark-done-circle' },
  'Cancelled':        { color: '#EF4444', bg: '#EF444420', icon: 'close-circle-outline' },
};

export default function OrderHistoryScreen({ navigation }) {
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [filter,    setFilter]    = useState('All');
  const { user }   = useSelector(s => s.auth);
  const { isDark } = useSelector(s => s.theme);

  const bg     = isDark ? '#0A0A0A' : '#F5F5F5';
  const cardBg = isDark ? '#141414' : '#FFFFFF';

  const FILTERS = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get(`/orders/user/${user._id || user.id}`);
      setOrders(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const displayed = filter === 'All'
    ? orders
    : orders.filter(o => o.orderStatus === filter);

  const renderOrder = ({ item }) => {
    const cfg = STATUS_CONFIG[item.orderStatus] || STATUS_CONFIG['Pending'];
    const date = new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardBg }]}
        onPress={() => navigation.navigate('OrderTracking', { order: item })}
        activeOpacity={0.85}
      >
        {/* Order Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.orderId, { color: isDark ? '#FFD700' : '#B8960C' }]}>
              #{item._id.slice(-8).toUpperCase()}
            </Text>
            <Text style={styles.orderDate}>{date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Icon name={cfg.icon} size={12} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{item.orderStatus}</Text>
          </View>
        </View>

        {/* Products */}
        <View style={styles.productsRow}>
          {(item.products || []).slice(0, 2).map((p, i) => (
            <View key={i} style={styles.productItem}>
              <View style={styles.productEmoji}>
                <Text style={{ fontSize: 20 }}>👔</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.productName, { color: isDark ? '#FFF' : '#111' }]} numberOfLines={1}>
                  {p.name || p.productId?.name || 'Product'}
                </Text>
                <Text style={styles.productMeta}>Qty: {p.quantity}</Text>
              </View>
            </View>
          ))}
          {(item.products || []).length > 2 && (
            <Text style={styles.moreItems}>+{item.products.length - 2} more items</Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.payLabel}>
              {item.paymentMethod?.toUpperCase() || 'CARD'} •{' '}
              <Text style={{ color: item.paymentStatus === 'Completed' ? '#22C55E' : '#F59E0B' }}>
                {item.paymentStatus || 'Pending'}
              </Text>
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: isDark ? '#888' : '#999' }]}>Total</Text>
            <Text style={styles.totalValue}>₹{item.totalAmount?.toLocaleString()}</Text>
          </View>
        </View>

        {/* Track button */}
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => navigation.navigate('OrderTracking', { order: item })}
        >
          <Icon name="location-outline" size={14} color="#FFD700" />
          <Text style={styles.trackBtnText}>Track Order</Text>
          <Icon name="chevron-forward" size={14} color="#FFD700" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? ['#0A0A0A','#141414'] : ['#FFF','#F5F5F5']} style={styles.header}>
        <View>
          <Text style={styles.headerTa}>என் ஆர்டர்கள்</Text>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#111' }]}>My Orders</Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: isDark ? '#1E1E1E' : '#EEE' }]}>
          <Text style={[styles.countText, { color: isDark ? '#FFD700' : '#B8960C' }]}>{orders.length}</Text>
        </View>
      </LinearGradient>

      {/* Filter Chips */}
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setFilter(item)}
            style={[styles.chip, filter === item && styles.chipActive,
              { backgroundColor: filter === item ? '#FFD700' : (isDark ? '#1E1E1E' : '#EEE') }]}
          >
            <Text style={[styles.chipText, filter === item && styles.chipTextActive,
              { color: filter === item ? '#000' : (isDark ? '#CCC' : '#666') }]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Orders List */}
      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={displayed}
          renderItem={renderOrder}
          keyExtractor={i => i._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }}
              tintColor="#FFD700" />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : '#111' }]}>No orders yet</Text>
              <Text style={styles.emptySubtitle}>Start shopping to see your orders here</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.shopBtn}>
                <LinearGradient colors={['#FFD700', '#B8960C']} style={styles.shopBtnGrad}>
                  <Text style={styles.shopBtnText}>Browse Collection</Text>
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
  headerTa:       { color: '#FFD700', fontSize: 12, letterSpacing: 1 },
  headerTitle:    { fontSize: 26, fontWeight: '800' },
  countBadge:     { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  countText:      { fontSize: 18, fontWeight: '900' },
  filterRow:      { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#2A2A2A' },
  chipActive:     { borderColor: '#FFD700' },
  chipText:       { fontSize: 12 },
  chipTextActive: { fontWeight: '700' },
  card:           { borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden' },
  cardHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 14, paddingBottom: 10 },
  orderId:        { fontSize: 14, fontWeight: '800', fontFamily: 'monospace' },
  orderDate:      { color: '#888', fontSize: 11, marginTop: 2 },
  statusBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText:     { fontSize: 11, fontWeight: '700' },
  productsRow:    { paddingHorizontal: 14, paddingBottom: 10, gap: 8 },
  productItem:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  productEmoji:   { width: 36, height: 36, backgroundColor: '#1E1E1E', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  productName:    { fontSize: 13, fontWeight: '600' },
  productMeta:    { color: '#888', fontSize: 11 },
  moreItems:      { color: '#888', fontSize: 11, marginTop: 4 },
  cardFooter:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 10 },
  payLabel:       { color: '#888', fontSize: 11 },
  totalRow:       { alignItems: 'flex-end' },
  totalLabel:     { fontSize: 10 },
  totalValue:     { color: '#FFD700', fontSize: 16, fontWeight: '800' },
  trackBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderTopWidth: 1, borderTopColor: '#2A2A2A', padding: 10 },
  trackBtnText:   { color: '#FFD700', fontSize: 13, fontWeight: '600' },
  empty:          { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyEmoji:     { fontSize: 56 },
  emptyTitle:     { fontSize: 20, fontWeight: '700' },
  emptySubtitle:  { color: '#888', fontSize: 14 },
  shopBtn:        { marginTop: 8, borderRadius: 12, overflow: 'hidden' },
  shopBtnGrad:    { paddingHorizontal: 28, paddingVertical: 14 },
  shopBtnText:    { color: '#000', fontWeight: '700', fontSize: 14 },
});
