import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, TextInput, Alert, StatusBar } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

export default function AdminDashboardScreen() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, usersCount: 0, lowStockCount: 0 });
  const [lowStock, setLowStock] = useState([]);
  const [view, setView] = useState('dashboard'); // dashboard | stock | addProduct
  const [updateStock, setUpdateStock] = useState({});
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'shirts', stock: '', description: '', image: '' });
  const dispatch = useDispatch();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [orderRes, statRes, stockRes] = await Promise.all([
        api.get('/orders'),
        api.get('/admin/stats'),
        api.get('/admin/low-stock')
      ]);
      setOrders(orderRes.data);
      setStats(statRes.data);
      setLowStock(stockRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    dispatch(logout());
  };

  const submitStockUpdate = async (id) => {
    try {
      const qs = updateStock[id];
      if(!qs) return;
      await api.put(`/admin/stock/${id}`, { stock: Number(qs) });
      Alert.alert('Success', 'Stock updated!');
      fetchData(); // refresh
    } catch(err) {
      Alert.alert('Error', 'Failed to update');
    }
  }

  const handleAddProduct = async () => {
    try {
      if(!newProduct.name || !newProduct.price || !newProduct.stock) return Alert.alert('Error', 'Please fill required fields');
      await api.post('/products', { ...newProduct, price: Number(newProduct.price), stock: Number(newProduct.stock) });
      Alert.alert('Success', 'Product added successfully!');
      setNewProduct({ name: '', price: '', category: 'shirts', stock: '', description: '', image: '' });
      setView('dashboard');
      fetchData();
    } catch(err) {
      Alert.alert('Error', 'Failed to add product');
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.text}>ID: {item._id}</Text>
      <Text style={styles.text}>USER: {item.userId?.email}</Text>
      <Text style={[styles.text, {color: '#FFD700', fontWeight: 'bold', marginTop: 10}]}>STATUS: {item.orderStatus || 'Pending'}</Text>
      <Text style={[styles.text, {color: '#fff', fontWeight: 'bold'}]}>AMT: Rs. {item.totalAmount}</Text>
    </View>
  );

  const renderLowStock = ({ item }) => (
    <View style={[styles.card, {borderColor: 'red'}]}>
      <Text style={[styles.text, {fontWeight: 'bold', color: '#fff'}]}>{item.name}</Text>
      <Text style={[styles.text, { color: '#ff4444', fontWeight: 'bold' }]}>CURRENT STOCK: {item.stock}</Text>
      <View style={styles.row}>
        <TextInput 
          style={styles.input} 
          placeholder="New Qty" 
          placeholderTextColor="#888"
          keyboardType="numeric"
          onChangeText={t => setUpdateStock({...updateStock, [item._id]: t})}
        />
        <TouchableOpacity style={styles.btnSmall} onPress={() => submitStockUpdate(item._id)}>
          <Text style={styles.btnText}>UPDATE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#0a0a0a', '#171300']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerRow}>
        <Text style={styles.header}>ADMIN HUB</Text>
        <TouchableOpacity onPress={handleLogout}><Text style={styles.logoutText}>LOGOUT</Text></TouchableOpacity>
      </View>
      
      <View style={styles.tabsRow}>
        <TouchableOpacity onPress={() => setView('dashboard')} style={[styles.tabBtn, view==='dashboard'&&styles.activeTabBtn]}><Text style={[styles.tab, view==='dashboard'&&styles.activeTab]}>STATS</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setView('stock')} style={[styles.tabBtn, view==='stock'&&styles.activeTabBtn]}><Text style={[styles.tab, view==='stock'&&styles.activeTab]}>LOW STOCK ({stats.lowStockCount})</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setView('addProduct')} style={[styles.tabBtn, view==='addProduct'&&styles.activeTabBtn]}><Text style={[styles.tab, view==='addProduct'&&styles.activeTab]}>+ PRODUCT</Text></TouchableOpacity>
      </View>

      {view === 'dashboard' && (
        <ScrollView>
          <View style={styles.statsCard}>
            <Text style={styles.statLabel}>TOTAL REVENUE</Text>
            <Text style={styles.statValue}>Rs. {stats.totalRevenue}</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.statsCard, { flex: 1, marginRight: 5 }]}><Text style={styles.statLabel}>ORDERS</Text><Text style={styles.statValue}>{stats.totalOrders}</Text></View>
            <View style={[styles.statsCard, { flex: 1, marginLeft: 5 }]}><Text style={styles.statLabel}>CUSTOMERS</Text><Text style={styles.statValue}>{stats.usersCount}</Text></View>
          </View>
          <Text style={styles.sectionTitle}>RECENT ORDERS ({orders.length})</Text>
          {orders.map(o => <View key={o._id}>{renderOrder({item: o})}</View>)}
        </ScrollView>
      )}

      {view === 'stock' && (
        <FlatList data={lowStock} renderItem={renderLowStock} keyExtractor={item => item._id} />
      )}

      {view === 'addProduct' && (
        <ScrollView style={styles.addForm}>
          <Text style={styles.sectionTitle}>ADD NEW PRODUCT</Text>
          <TextInput style={styles.formInput} placeholder="Product Name" placeholderTextColor="#888" value={newProduct.name} onChangeText={t => setNewProduct({...newProduct, name: t})} />
          <TextInput style={styles.formInput} placeholder="Price (Rs.)" placeholderTextColor="#888" keyboardType="numeric" value={newProduct.price} onChangeText={t => setNewProduct({...newProduct, price: t})} />
          <TextInput style={styles.formInput} placeholder="Stock Quantity" placeholderTextColor="#888" keyboardType="numeric" value={newProduct.stock} onChangeText={t => setNewProduct({...newProduct, stock: t})} />
          <TextInput style={styles.formInput} placeholder="Category (e.g., shirts, pants)" placeholderTextColor="#888" value={newProduct.category} onChangeText={t => setNewProduct({...newProduct, category: t})} />
          <TextInput style={[styles.formInput, {height: 100}]} placeholder="Description" placeholderTextColor="#888" multiline value={newProduct.description} onChangeText={t => setNewProduct({...newProduct, description: t})} />
          <TextInput style={styles.formInput} placeholder="Image URL" placeholderTextColor="#888" value={newProduct.image} onChangeText={t => setNewProduct({...newProduct, image: t})} />
          
          <TouchableOpacity style={styles.addBtnLarge} onPress={handleAddProduct}>
            <Text style={styles.addBtnLargeText}>SAVE PRODUCT</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  header: { fontSize: 26, fontWeight: '900', color: '#FFD700', letterSpacing: 2 },
  logoutText: { color: '#ff4444', fontWeight: 'bold', letterSpacing: 1 },
  tabsRow: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  tabBtn: { padding: 10, borderWidth: 1, borderColor: '#332b00', borderRadius: 4, flex: 1, alignItems: 'center' },
  activeTabBtn: { borderColor: '#FFD700', backgroundColor: 'rgba(255,215,0,0.1)' },
  tab: { color: '#888', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  activeTab: { color: '#FFD700' },
  sectionTitle: { color: '#FFD700', fontSize: 15, marginVertical: 15, fontWeight: 'bold', letterSpacing: 1 },
  statsCard: { backgroundColor: 'rgba(255,215,0,0.05)', padding: 25, borderRadius: 4, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#FFD700' },
  statLabel: { color: '#FFD700', fontSize: 12, marginBottom: 10, letterSpacing: 1 },
  statValue: { color: '#fff', fontSize: 28, fontWeight: '900', textShadowColor: '#FFD700', textShadowRadius: 8 },
  card: { backgroundColor: 'rgba(0,0,0,0.4)', padding: 15, borderRadius: 4, marginBottom: 10, borderWidth: 1, borderColor: '#332b00' },
  text: { color: '#aaa', fontSize: 13, marginBottom: 5, letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  input: { backgroundColor: '#111', color: '#FFD700', borderRadius: 4, flex: 1, marginRight: 10, paddingHorizontal: 15, borderWidth: 1, borderColor: '#FFD700' },
  btnSmall: { backgroundColor: '#FFD700', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 4, justifyContent: 'center' },
  btnText: { color: '#000', fontWeight: '900', letterSpacing: 1 },
  addForm: { flex: 1 },
  formInput: { backgroundColor: '#111', color: '#fff', padding: 15, borderRadius: 4, borderWidth: 1, borderColor: '#332b00', marginBottom: 15 },
  addBtnLarge: { backgroundColor: '#FFD700', padding: 18, borderRadius: 4, alignItems: 'center', marginTop: 10, shadowColor: '#FFD700', shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  addBtnLargeText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 }
});
