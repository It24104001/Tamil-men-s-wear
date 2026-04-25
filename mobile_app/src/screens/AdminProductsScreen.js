import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator, TextInput, Modal, ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

export default function AdminProductsScreen({ navigation }) {
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form, setForm] = useState({ name:'', price:'', category:'', description:'', stock:'', discount:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try { setLoading(true); const r = await api.get('/products'); setProducts(r.data); }
    catch (e) { Alert.alert('Error', 'Could not load products'); }
    finally { setLoading(false); }
  };

  const openAdd  = () => { setEditing(null); setForm({ name:'', price:'', category:'', description:'', stock:'', discount:'' }); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name:p.name, price:String(p.price), category:p.category||'', description:p.description||'', stock:String(p.stock||0), discount:String(p.discount||0) }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.price) { Alert.alert('Name and price are required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock||0), discount: Number(form.discount||0) };
      if (editing) { await api.put(`/products/${editing._id}`, payload); }
      else          { await api.post('/products', payload); }
      setShowModal(false); fetchProducts();
    } catch (e) { Alert.alert('Error', e.response?.data?.msg || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Product', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/products/${id}`); fetchProducts(); }
        catch (e) { Alert.alert('Error', 'Could not delete'); }
      }}
    ]);
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const renderProduct = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardEmoji}>👔</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardMeta}>{item.category} · Stock: {item.stock}</Text>
          <Text style={styles.cardPrice}>₹{item.price?.toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}>
          <Icon name="pencil-outline" size={16} color="#FFD700" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id, item.name)} style={styles.deleteBtn}>
          <Icon name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="arrow-back" size={22} color="#FFD700" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Products ({products.length})</Text>
        <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
          <Icon name="add" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Icon name="search" size={16} color="#666" />
        <TextInput style={styles.searchInput} placeholder="Search products..." placeholderTextColor="#666" value={search} onChangeText={setSearch} />
      </View>

      {loading ? <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 40 }} /> : (
        <FlatList data={filtered} renderItem={renderProduct} keyExtractor={i => i._id}
          contentContainerStyle={{ padding: 16, gap: 10 }} showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>No products found</Text>} />
      )}

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Product' : 'Add Product'}</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {[
                { key:'name',        label:'Product Name',  keyb:'default' },
                { key:'price',       label:'Price (₹)',     keyb:'numeric' },
                { key:'category',    label:'Category',      keyb:'default' },
                { key:'stock',       label:'Stock',         keyb:'numeric' },
                { key:'discount',    label:'Discount (%)',  keyb:'numeric' },
                { key:'description', label:'Description',   keyb:'default' },
              ].map(f => (
                <View key={f.key} style={styles.formField}>
                  <Text style={styles.formLabel}>{f.label}</Text>
                  <TextInput style={styles.formInput} placeholder={f.label}
                    placeholderTextColor="#555" value={form[f.key]}
                    onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                    keyboardType={f.keyb} multiline={f.key === 'description'} />
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
                <LinearGradient colors={['#FFD700','#B8960C']} style={styles.saveBtnGrad}>
                  {saving ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.saveText}>Save</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0A0A0A' },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, gap: 12 },
  headerTitle:  { flex: 1, color: '#FFF', fontSize: 18, fontWeight: '700' },
  addBtn:       { width: 36, height: 36, backgroundColor: '#FFD700', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  searchBar:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8, backgroundColor: '#1E1E1E', borderRadius: 12, paddingHorizontal: 12, height: 42 },
  searchInput:  { flex: 1, color: '#FFF', fontSize: 14 },
  card:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#2A2A2A' },
  cardLeft:     { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  cardEmoji:    { fontSize: 28, width: 40 },
  cardName:     { color: '#FFF', fontSize: 14, fontWeight: '600' },
  cardMeta:     { color: '#888', fontSize: 11, marginTop: 2 },
  cardPrice:    { color: '#FFD700', fontSize: 13, fontWeight: '700', marginTop: 2 },
  cardActions:  { flexDirection: 'row', gap: 8 },
  editBtn:      { width: 34, height: 34, backgroundColor: '#FFD70020', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  deleteBtn:    { width: 34, height: 34, backgroundColor: '#EF444420', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  empty:        { color: '#888', textAlign: 'center', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  modal:        { backgroundColor: '#141414', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  modalTitle:   { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  formField:    { marginBottom: 12 },
  formLabel:    { color: '#888', fontSize: 12, marginBottom: 4 },
  formInput:    { backgroundColor: '#1E1E1E', color: '#FFF', borderRadius: 10, padding: 12, fontSize: 14 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn:    { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#2A2A2A', alignItems: 'center' },
  cancelText:   { color: '#888', fontWeight: '600' },
  saveBtn:      { flex: 1, borderRadius: 12, overflow: 'hidden' },
  saveBtnGrad:  { padding: 14, alignItems: 'center' },
  saveText:     { color: '#000', fontWeight: '700' },
});
