import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/orders/user/${user._id || user.id}`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.orderId}>ORDER #{item._id.slice(-6).toUpperCase()}</Text>
        <Text style={[styles.status, item.orderStatus === 'Pending' ? styles.statusPending : styles.statusDone]}>
          {item.orderStatus.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      <View style={styles.divider} />
      {item.products.map((p, idx) => (
        <Text key={idx} style={styles.productText}>• {p.quantity}x Rs. {p.price}</Text>
      ))}
      <View style={styles.divider} />
      <Text style={styles.total}>TOTAL: Rs. {item.totalAmount}</Text>
    </View>
  );

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#FFD700" /></View>;

  return (
    <LinearGradient colors={['#0a0a0a', '#171300']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.header}>ORDER HISTORY</Text>
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>NO ORDERS FOUND</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
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
  card: { backgroundColor: 'rgba(255, 215, 0, 0.05)', borderRadius: 4, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#332b00' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  orderId: { color: '#FFD700', fontWeight: 'bold', fontSize: 16 },
  status: { fontWeight: '900', fontSize: 12 },
  statusPending: { color: '#FFA500' },
  statusDone: { color: '#00FF00' },
  date: { color: '#888', fontSize: 12, marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#332b00', marginVertical: 10 },
  productText: { color: '#ddd', fontSize: 13, marginBottom: 2 },
  total: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'right' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 14, letterSpacing: 1 }
});
