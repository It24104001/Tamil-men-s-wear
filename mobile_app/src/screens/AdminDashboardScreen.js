import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, TextInput, Alert, StatusBar, Image, Animated, Modal, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import api, { baseURL } from '../api/api';
import * as ImagePicker from 'expo-image-picker';

const CATEGORIES = ['shirts', 'pants', 'suits', 'traditional', 'formal', 'casual', 'ethnic', 'accessories', 'innerwear'];

export default function AdminDashboardScreen() {
  const [orders,          setOrders]          = useState([]);
  const [customers,       setCustomers]       = useState([]);
  const [requests,        setRequests]        = useState([]);
  const [products,        setProducts]        = useState([]);
  const [inventory,       setInventory]       = useState([]);
  const [stats,           setStats]           = useState({ totalRevenue: 0, totalOrders: 0, usersCount: 0, productsCount: 0, lowStockCount: 0, pendingOrders: 0 });
  const [view,            setView]            = useState('dashboard');
  const [loading,         setLoading]         = useState(true);
  
  // Modals & Editing
  const [editingItem,      setEditingItem]      = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editType,         setEditType]         = useState(null);
  
  // Inventory inline edit state
  const [inventoryUpdate, setInventoryUpdate] = useState({});

  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'shirts', stock: '', description: '', image: null });
  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, statRes, prodRes, customerRes, requestRes, inventoryRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/stats'),
        api.get('/products'),
        api.get('/admin/customers'),
        api.get('/product-requests/admin'),
        api.get('/admin/inventory')
      ]);
      setOrders(orderRes.data);
      setStats(statRes.data);
      setProducts(prodRes.data);
      setCustomers(customerRes.data);
      setRequests(requestRes.data);
      setInventory(inventoryRes.data);
    } catch (err) {
      console.error('Admin fetch error:', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    dispatch(logout());
  };

  const confirmDelete = (title, msg, onConfirm) => {
    if (Platform.OS === 'web') {
      if(window.confirm(msg)) onConfirm();
    } else {
      Alert.alert(title, msg, [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: onConfirm }]);
    }
  };

  const deleteEntity = async (endpoint, successMsg) => {
    try {
      await api.delete(endpoint);
      fetchData();
    } catch(err) { Alert.alert('Error', `Could not delete ${successMsg}`); }
  };

  const submitInventoryUpdate = async (id) => {
    try {
      const { stock, threshold } = inventoryUpdate[id] || {};
      if(stock === undefined && threshold === undefined) {
          if(Platform.OS === 'web') window.alert('No changes made');
          else Alert.alert('Error', 'No changes made');
          return;
      }
      
      let payload = {};
      if (stock) payload.stock = Number(stock);
      if (threshold) payload.lowStockThreshold = Number(threshold);
      
      await api.put(`/admin/inventory/${id}`, payload);
      
      if(Platform.OS === 'web') window.alert('Inventory updated successfully!');
      else Alert.alert('Success', 'Inventory updated successfully!');
      
      setInventoryUpdate({...inventoryUpdate, [id]: {}}); 
      fetchData(); 
    } catch(err) {
      if(Platform.OS === 'web') window.alert('Failed to update inventory');
      else Alert.alert('Error', 'Failed to update inventory');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 5], quality: 0.8 });
    if (!result.canceled) setNewProduct({ ...newProduct, image: result.assets[0] });
  };

  const handleAddProduct = async () => {
    try {
      if(!newProduct.name || !newProduct.price || !newProduct.stock) return Alert.alert('Validation Error', 'Please fill all required fields');
      if(isNaN(newProduct.price) || Number(newProduct.price) <= 0) return Alert.alert('Validation Error', 'Price must be a valid positive number');
      if(isNaN(newProduct.stock) || Number(newProduct.stock) < 0) return Alert.alert('Validation Error', 'Stock must be a valid non-negative number');
      
      let imageUrl = 'https://via.placeholder.com/300';
      if (newProduct.image) {
        const formData = new FormData();
        
        if (Platform.OS === 'web') {
           if (newProduct.image.file) {
             formData.append('image', newProduct.image.file);
           } else {
             const res = await fetch(newProduct.image.uri);
             const blob = await res.blob();
             formData.append('image', blob, 'photo.jpg');
           }
        } else {
           let filename = newProduct.image.uri.split('/').pop();
           let match = /\.(\w+)$/.exec(filename);
           let type = match ? `image/${match[1]}` : `image`;
           formData.append('image', { uri: newProduct.image.uri, type: type, name: filename });
        }
        
        const uploadRes = await api.post('/upload', formData);
        imageUrl = baseURL + uploadRes.data;
      }
      
      const productToSave = { ...newProduct, price: Number(newProduct.price), stock: Number(newProduct.stock), images: [imageUrl], sizeAvailable: ['S', 'M', 'L', 'XL'] };
      await api.post('/products', productToSave);
      Alert.alert('Success', 'Product published successfully!');
      setNewProduct({ name: '', price: '', category: 'shirts', stock: '', description: '', image: null });
      setView('products');
      fetchData();
    } catch(err) {
      Alert.alert('Error', 'Failed to publish product.');
    }
  };

  const openEditModal = (type, item) => {
    setEditType(type);
    setEditingItem(JSON.parse(JSON.stringify(item))); 
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    try {
      if (editType === 'product') {
        await api.put(`/products/${editingItem._id}`, editingItem);
      } else if (editType === 'order') {
        await api.put(`/admin/orders/${editingItem._id}`, { orderStatus: editingItem.orderStatus, paymentStatus: editingItem.paymentStatus });
      } else if (editType === 'request') {
        await api.put(`/product-requests/admin/${editingItem._id}`, { status: editingItem.status });
      } else if (editType === 'user') {
        await api.put(`/admin/customers/${editingItem._id}`, { name: editingItem.name, email: editingItem.email });
      }
      
      if (Platform.OS === 'web') window.alert('Updated Successfully!');
      else Alert.alert('Success', 'Updated Successfully!');
      
      setEditModalVisible(false);
      fetchData();
    } catch(err) {
      if (Platform.OS === 'web') window.alert('Failed to update record');
      else Alert.alert('Error', 'Failed to update record');
    }
  };

  // ---------------- TABLE RENDERERS ----------------
  const renderOrderRow = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, {flex: 2, fontWeight: 'bold'}]}>#{item._id.substring(18)}</Text>
      <Text style={[styles.tableCell, {flex: 3}]}>{item.userId?.email || 'Unknown'}</Text>
      <Text style={[styles.tableCell, {flex: 2, color: item.orderStatus === 'Pending' ? 'orange' : '#4CAF50'}]}>{item.orderStatus}</Text>
      <Text style={[styles.tableCell, {flex: 2, color: '#FFD700'}]}>Rs. {item.totalAmount}</Text>
      <View style={[styles.tableCell, {flex: 3, flexDirection: 'row', gap: 10}]}>
        <TouchableOpacity style={styles.tableActionBtn} onPress={() => openEditModal('order', item)}><Text style={styles.tableActionText}>EDIT</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tableDeleteBtn} onPress={() => confirmDelete("Confirm", "Delete order?", () => deleteEntity(`/orders/${item._id}`, "order"))}><Text style={styles.tableDeleteText}>DEL</Text></TouchableOpacity>
      </View>
    </View>
  );

  const renderProductRow = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, {flex: 3, fontWeight: 'bold'}]}>{item.name}</Text>
      <Text style={[styles.tableCell, {flex: 2}]}>{item.category.toUpperCase()}</Text>
      <Text style={[styles.tableCell, {flex: 2}]}>{item.stock}</Text>
      <Text style={[styles.tableCell, {flex: 2, color: '#FFD700'}]}>Rs. {item.price}</Text>
      <View style={[styles.tableCell, {flex: 3, flexDirection: 'row', gap: 10}]}>
        <TouchableOpacity style={styles.tableActionBtn} onPress={() => openEditModal('product', item)}><Text style={styles.tableActionText}>EDIT</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tableDeleteBtn} onPress={() => confirmDelete("Confirm", "Delete product?", () => deleteEntity(`/products/${item._id}`, "product"))}><Text style={styles.tableDeleteText}>DEL</Text></TouchableOpacity>
      </View>
    </View>
  );

  const renderInventoryRow = ({ item }) => {
    const isLowStock = item.stock < (item.lowStockThreshold || 5);
    return (
      <View style={[styles.tableRow, isLowStock && { backgroundColor: 'rgba(255,0,0,0.1)' }]}>
        <Text style={[styles.tableCell, {flex: 3, fontWeight: 'bold'}]}>{item.name}</Text>
        <Text style={[styles.tableCell, {flex: 1, color: isLowStock ? '#ff4444' : '#ccc'}]}>{item.stock}</Text>
        <Text style={[styles.tableCell, {flex: 1}]}>{item.lowStockThreshold || 5}</Text>
        <View style={[styles.tableCell, {flex: 4, flexDirection: 'row', gap: 10, alignItems: 'center'}]}>
          <TextInput style={styles.tableInput} placeholder="+Stock" placeholderTextColor="#666" keyboardType="numeric" onChangeText={t => setInventoryUpdate({...inventoryUpdate, [item._id]: {...inventoryUpdate[item._id], stock: t}})} />
          <TextInput style={styles.tableInput} placeholder="Set Thr" placeholderTextColor="#666" keyboardType="numeric" onChangeText={t => setInventoryUpdate({...inventoryUpdate, [item._id]: {...inventoryUpdate[item._id], threshold: t}})} />
          <TouchableOpacity style={[styles.tableActionBtn, {backgroundColor: '#FFD700'}]} onPress={() => submitInventoryUpdate(item._id)}>
            <Text style={[styles.tableActionText, {color: '#000'}]}>APPLY</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCustomerRow = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, {flex: 3, fontWeight: 'bold'}]}>{item.name}</Text>
      <Text style={[styles.tableCell, {flex: 3}]}>{item.email}</Text>
      <Text style={[styles.tableCell, {flex: 2, color: '#FFD700'}]}>{item.loyaltyPoints} PTS</Text>
      <View style={[styles.tableCell, {flex: 3, flexDirection: 'row', gap: 10}]}>
        <TouchableOpacity style={styles.tableActionBtn} onPress={() => openEditModal('user', item)}><Text style={styles.tableActionText}>EDIT</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tableDeleteBtn} onPress={() => confirmDelete("Confirm", "Delete customer?", () => deleteEntity(`/admin/customers/${item._id}`, "customer"))}><Text style={styles.tableDeleteText}>DEL</Text></TouchableOpacity>
      </View>
    </View>
  );

  const renderRequestRow = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, {flex: 3, fontWeight: 'bold'}]}>{item.productName}</Text>
      <Text style={[styles.tableCell, {flex: 3}]}>{item.userId?.email || 'Unknown'}</Text>
      <Text style={[styles.tableCell, {flex: 2, color: item.status === 'fulfilled' ? '#4CAF50' : '#FFD700'}]}>{item.status.toUpperCase()}</Text>
      <View style={[styles.tableCell, {flex: 3, flexDirection: 'row', gap: 10}]}>
        <TouchableOpacity style={styles.tableActionBtn} onPress={() => openEditModal('request', item)}><Text style={styles.tableActionText}>EDIT</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tableDeleteBtn} onPress={() => confirmDelete("Confirm", "Delete request?", () => deleteEntity(`/product-requests/admin/${item._id}`, "request"))}><Text style={styles.tableDeleteText}>DEL</Text></TouchableOpacity>
      </View>
    </View>
  );

  // ---------------- TABLE HELPERS ----------------
  const renderTableHeader = (headers) => (
    <View style={styles.tableHeaderRow}>
      {headers.map((h, i) => <Text key={i} style={[styles.tableHeaderText, {flex: h.flex}]}>{h.label}</Text>)}
    </View>
  );

  const TABS = [
    { id: 'dashboard', label: 'STATS' },
    { id: 'inventory', label: 'INVENTORY' },
    { id: 'products', label: 'CATALOG' },
    { id: 'addProduct', label: '+ PRODUCT' },
    { id: 'orders', label: 'ORDERS' },
    { id: 'customers', label: 'USERS' },
    { id: 'requests', label: 'REQUESTS' },
  ];

  return (
    <LinearGradient colors={['#050505', '#1a1500', '#0a0a0a']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.headerArea}>
        <View>
          <Text style={styles.headerTitle}>ADMIN HUB</Text>
          <Text style={styles.headerSub}>Command Center</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>EXIT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab.id} onPress={() => { fadeAnim.setValue(0); setView(tab.id); }} style={[styles.tabBtn, view === tab.id && styles.activeTabBtn]}>
              <Text style={[styles.tabText, view === tab.id && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{translateY: fadeAnim.interpolate({inputRange: [0, 1], outputRange: [20, 0]})}] }}>
        
        {view === 'dashboard' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <LinearGradient colors={['rgba(255,215,0,0.15)', 'rgba(255,215,0,0.02)']} style={styles.heroStatCard}>
              <Text style={styles.statLabel}>GROSS REVENUE</Text>
              <Text style={styles.statHugeValue}>Rs. {stats.totalRevenue.toLocaleString()}</Text>
            </LinearGradient>
            <View style={styles.statsGrid}>
              <View style={styles.statGridItem}><Text style={styles.statLabel}>TOTAL ORDERS</Text><Text style={styles.statValue}>{stats.totalOrders}</Text></View>
              <View style={styles.statGridItem}><Text style={styles.statLabel}>LOW STOCK</Text><Text style={[styles.statValue, {color: '#ff4444'}]}>{stats.lowStockCount}</Text></View>
            </View>
          </ScrollView>
        )}

        {view === 'inventory' && (
          <ScrollView horizontal style={{ flex: 1 }}>
            <View style={styles.tableContainer}>
              {renderTableHeader([{label:'PRODUCT', flex:3}, {label:'STOCK', flex:1}, {label:'ALERT THR.', flex:1}, {label:'ACTIONS', flex:4}])}
              <FlatList data={products} renderItem={renderInventoryRow} keyExtractor={item => item._id} contentContainerStyle={{paddingBottom: 50}} />
            </View>
          </ScrollView>
        )}

        {view === 'products' && (
          <ScrollView horizontal style={{ flex: 1 }}>
            <View style={styles.tableContainer}>
              {renderTableHeader([{label:'NAME', flex:3}, {label:'CATEGORY', flex:2}, {label:'STOCK', flex:2}, {label:'PRICE', flex:2}, {label:'ACTIONS', flex:3}])}
              <FlatList data={products} renderItem={renderProductRow} keyExtractor={item => item._id} contentContainerStyle={{paddingBottom: 50}} />
            </View>
          </ScrollView>
        )}

        {view === 'orders' && (
          <ScrollView horizontal style={{ flex: 1 }}>
            <View style={styles.tableContainer}>
              {renderTableHeader([{label:'ORDER ID', flex:2}, {label:'CUSTOMER', flex:3}, {label:'STATUS', flex:2}, {label:'TOTAL', flex:2}, {label:'ACTIONS', flex:3}])}
              <FlatList data={orders} renderItem={renderOrderRow} keyExtractor={item => item._id} contentContainerStyle={{paddingBottom: 50}} />
            </View>
          </ScrollView>
        )}

        {view === 'customers' && (
          <ScrollView horizontal style={{ flex: 1 }}>
            <View style={styles.tableContainer}>
              {renderTableHeader([{label:'NAME', flex:3}, {label:'EMAIL', flex:3}, {label:'POINTS', flex:2}, {label:'ACTIONS', flex:3}])}
              <FlatList data={customers} renderItem={renderCustomerRow} keyExtractor={item => item._id} contentContainerStyle={{paddingBottom: 50}} />
            </View>
          </ScrollView>
        )}

        {view === 'requests' && (
          <ScrollView horizontal style={{ flex: 1 }}>
            <View style={styles.tableContainer}>
              {renderTableHeader([{label:'PRODUCT', flex:3}, {label:'CUSTOMER', flex:3}, {label:'STATUS', flex:2}, {label:'ACTIONS', flex:3}])}
              <FlatList data={requests} renderItem={renderRequestRow} keyExtractor={item => item._id} contentContainerStyle={{paddingBottom: 50}} />
            </View>
          </ScrollView>
        )}

        {view === 'addProduct' && (
          <ScrollView contentContainerStyle={styles.addForm}>
            <Text style={styles.formSectionTitle}>Create Product</Text>
            <TextInput style={styles.formInput} placeholder="Product Name" placeholderTextColor="#666" value={newProduct.name} onChangeText={t => setNewProduct({...newProduct, name: t})} />
            <View style={{flexDirection: 'row', gap: 10}}>
              <TextInput style={[styles.formInput, {flex: 1}]} placeholder="Price" placeholderTextColor="#666" keyboardType="numeric" value={newProduct.price} onChangeText={t => setNewProduct({...newProduct, price: t})} />
              <TextInput style={[styles.formInput, {flex: 1}]} placeholder="Initial Stock" placeholderTextColor="#666" keyboardType="numeric" value={newProduct.stock} onChangeText={t => setNewProduct({...newProduct, stock: t})} />
            </View>
            
            <Text style={[styles.formSectionTitle, {marginTop: 15, marginBottom: 10}]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 20}}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity key={cat} style={[styles.catPill, newProduct.category === cat && styles.catPillActive]} onPress={() => setNewProduct({...newProduct, category: cat})}>
                  <Text style={[styles.catPillText, newProduct.category === cat && styles.catPillTextActive]}>{cat.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput style={[styles.formInput, {height: 100}]} placeholder="Description..." placeholderTextColor="#666" multiline textAlignVertical="top" value={newProduct.description} onChangeText={t => setNewProduct({...newProduct, description: t})} />
            
            <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
              {newProduct.image ? <Image source={{ uri: newProduct.image.uri }} style={styles.previewImage} /> : <Text style={{color: '#888'}}>Upload Image</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.submitBtnLarge} onPress={handleAddProduct}>
              <LinearGradient colors={['#FFD700', '#FDB931']} style={{padding: 20, alignItems: 'center'}}><Text style={{color: '#000', fontWeight: '900'}}>PUBLISH</Text></LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        )}
      </Animated.View>

      {/* GLOBAL EDIT MODAL */}
      <Modal visible={editModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>UPDATE {editType?.toUpperCase()}</Text>
            {editType === 'product' && editingItem && (
              <>
                <TextInput style={styles.formInput} value={editingItem.name} onChangeText={t => setEditingItem({...editingItem, name: t})} />
                <TextInput style={styles.formInput} value={String(editingItem.price)} keyboardType="numeric" onChangeText={t => setEditingItem({...editingItem, price: t})} />
              </>
            )}
            {editType === 'order' && editingItem && (
              <>
                <TextInput style={styles.formInput} placeholder="Pending, Shipped, Delivered" placeholderTextColor="#666" value={editingItem.orderStatus} onChangeText={t => setEditingItem({...editingItem, orderStatus: t})} />
              </>
            )}
            {editType === 'request' && editingItem && (
              <>
                <TextInput style={styles.formInput} placeholder="reviewed, fulfilled" placeholderTextColor="#666" value={editingItem.status} onChangeText={t => setEditingItem({...editingItem, status: t})} />
              </>
            )}
            {editType === 'user' && editingItem && (
              <>
                <TextInput style={styles.formInput} value={editingItem.name} onChangeText={t => setEditingItem({...editingItem, name: t})} />
                <TextInput style={styles.formInput} value={editingItem.email} onChangeText={t => setEditingItem({...editingItem, email: t})} />
              </>
            )}
            <View style={{flexDirection: 'row', gap: 10, marginTop: 10}}>
              <TouchableOpacity style={[styles.tableActionBtn, {flex: 1, alignItems: 'center'}]} onPress={() => setEditModalVisible(false)}><Text style={{color: '#FFD700'}}>CANCEL</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.tableActionBtn, {flex: 1, alignItems: 'center', backgroundColor: '#FFD700'}]} onPress={saveEdit}><Text style={{color: '#000', fontWeight: 'bold'}}>SAVE</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { paddingHorizontal: 25, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#FFD700', letterSpacing: 2 },
  headerSub: { color: '#888', fontSize: 12, letterSpacing: 3, fontWeight: '600' },
  logoutBtn: { backgroundColor: 'rgba(255,68,68,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ff4444' },
  logoutText: { color: '#ff4444', fontWeight: 'bold', fontSize: 11 },
  
  tabScrollWrapper: { paddingLeft: 25, marginBottom: 15, height: 45 },
  tabsContainer: { paddingRight: 50, gap: 10, alignItems: 'center' },
  tabBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  activeTabBtn: { backgroundColor: 'rgba(255,215,0,0.15)', borderColor: '#FFD700' },
  tabText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '700' },
  activeTabText: { color: '#FFD700' },
  
  scrollContent: { padding: 25 },
  heroStatCard: { padding: 30, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)', alignItems: 'center', marginBottom: 20 },
  statLabel: { color: '#FFD700', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 10 },
  statHugeValue: { color: '#fff', fontSize: 38, fontWeight: '900' },
  statsGrid: { flexDirection: 'row', gap: 15 },
  statGridItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 25, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  statValue: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 5 },

  // TABLE STYLES
  tableContainer: { minWidth: 800, marginHorizontal: 25, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)', padding: 15, borderBottomWidth: 1, borderBottomColor: '#444' },
  tableHeaderText: { color: '#FFD700', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  tableRow: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#222', alignItems: 'center' },
  tableCell: { color: '#ccc', fontSize: 14, paddingRight: 10 },
  
  tableActionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#FFD700' },
  tableActionText: { color: '#FFD700', fontSize: 10, fontWeight: 'bold' },
  tableDeleteBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,0,0,0.1)', borderWidth: 1, borderColor: '#ff4444' },
  tableDeleteText: { color: '#ff4444', fontSize: 10, fontWeight: 'bold' },
  tableInput: { backgroundColor: '#000', color: '#fff', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#333', width: 60, fontSize: 12 },

  addForm: { padding: 25, paddingBottom: 100 },
  formSectionTitle: { color: '#FFD700', fontSize: 14, fontWeight: '800', marginBottom: 20, textTransform: 'uppercase' },
  formInput: { backgroundColor: '#111', color: '#fff', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#333', fontSize: 15, marginBottom: 15 },
  catPill: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, backgroundColor: '#111', marginRight: 10, borderWidth: 1, borderColor: '#333' },
  catPillActive: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  catPillText: { color: '#888', fontSize: 12, fontWeight: 'bold' },
  catPillTextActive: { color: '#000' },
  imagePickerBtn: { height: 150, backgroundColor: '#111', borderRadius: 15, borderWidth: 1, borderColor: '#333', borderStyle: 'dashed', overflow: 'hidden', marginBottom: 25, justifyContent: 'center', alignItems: 'center' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  submitBtnLarge: { borderRadius: 16, overflow: 'hidden' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1a1a1a', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: '#FFD700', fontSize: 18, fontWeight: 'bold', marginBottom: 20 }
});
