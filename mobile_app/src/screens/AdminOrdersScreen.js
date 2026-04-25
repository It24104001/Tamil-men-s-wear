import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator, TextInput, Modal,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

const ORDER_STATUSES = ['Pending','Confirmed','Shipped','Out for Delivery','Delivered','Cancelled'];
const STATUS_COLOR   = { 'Pending':'#F59E0B','Confirmed':'#3B82F6','Shipped':'#8B5CF6','Out for Delivery':'#F97316','Delivered':'#22C55E','Cancelled':'#EF4444' };

export default function AdminOrdersScreen({ navigation }) {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('All');
  const [selected, setSelected] = useState(null);
  const [showModal,setShowModal]= useState(false);
  const [newStatus,setNewStatus]= useState('');
  const [tracking, setTracking] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try { setLoading(true); const r = await api.get('/admin/orders'); setOrders(r.data); }
    catch (e) { Alert.alert('Error', 'Could not load orders'); }
    finally { setLoading(false); }
  };

  const openUpdate = (order) => {
    setSelected(order); setNewStatus(order.orderStatus);
    setTracking(order.trackingNumber || ''); setShowModal(true);
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await api.put(`/admin/orders/${selected._id}`, { orderStatus: newStatus, trackingNumber: tracking });
      setShowModal(false); fetchOrders();
    } catch (e) { Alert.alert('Error', 'Update failed'); }
    finally { setUpdating(false); }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Order', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/admin/orders/${id}`); fetchOrders(); }
        catch (e) { Alert.alert('Error', 'Delete failed'); }
      }}
    ]);
  };

  const displayed = filter === 'All' ? orders : orders.filter(o => o.orderStatus === filter);

  const renderOrder = ({ item }) => {
    const color = STATUS_COLOR[item.orderStatus] || '#888';
    const date  = new Date(item.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.orderId}>#{item._id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.customer}>{item.userId?.name || 'Customer'} · {date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.statusText, { color }]}>{item.orderStatus}</Text>
          </View>
        </View>
        <View style={styles.cardMid}>
          <Text style={styles.items}>{(item.products||[]).length} items</Text>
          <Text style={styles.amount}>₹{item.totalAmount?.toLocaleString()}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.updateBtn} onPress={() => openUpdate(item)}>
            <Icon name="create-outline" size={14} color="#FFD700" />
            <Text style={styles.updateBtnText}>Update Status</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
            <Icon name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders ({orders.length})</Text>
      </View>

      <FlatList horizontal data={['All',...ORDER_STATUSES]} keyExtractor={i=>i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal:16, paddingVertical:8, gap:8 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setFilter(item)}
            style={[styles.chip, filter===item && styles.chipActive]}>
            <Text style={[styles.chipText, filter===item && styles.chipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )} />

      {loading ? <ActivityIndicator size="large" color="#FFD700" style={{ marginTop:40 }} /> : (
        <FlatList data={displayed} renderItem={renderOrder} keyExtractor={i=>i._id}
          contentContainerStyle={{ padding:16, gap:10 }} showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>No orders found</Text>} />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Update Order #{selected?._id?.slice(-6).toUpperCase()}</Text>
            <Text style={styles.modalLabel}>Order Status</Text>
            {ORDER_STATUSES.map(s => (
              <TouchableOpacity key={s} onPress={() => setNewStatus(s)}
                style={[styles.statusOption, newStatus===s && styles.statusOptionActive]}>
                <View style={[styles.radioDot, { backgroundColor: newStatus===s ? '#FFD700':'#333' }]} />
                <Text style={[styles.statusOptionText, { color: STATUS_COLOR[s]||'#FFF' }]}>{s}</Text>
              </TouchableOpacity>
            ))}
            <Text style={[styles.modalLabel, { marginTop:10 }]}>Tracking Number</Text>
            <TextInput style={styles.trackInput} placeholder="e.g. TRK123456"
              placeholderTextColor="#555" value={tracking} onChangeText={setTracking} />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdate} disabled={updating} style={styles.saveBtn}>
                <LinearGradient colors={['#FFD700','#B8960C']} style={styles.saveBtnGrad}>
                  {updating ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.saveText}>Update</Text>}
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
  container:          { flex:1, backgroundColor:'#0A0A0A' },
  header:             { flexDirection:'row', alignItems:'center', paddingHorizontal:16, paddingTop:50, paddingBottom:12, gap:12 },
  headerTitle:        { flex:1, color:'#FFF', fontSize:18, fontWeight:'700' },
  chip:               { paddingHorizontal:12, paddingVertical:6, borderRadius:20, backgroundColor:'#1E1E1E', borderWidth:1, borderColor:'#2A2A2A' },
  chipActive:         { backgroundColor:'#FFD700', borderColor:'#FFD700' },
  chipText:           { color:'#888', fontSize:12 },
  chipTextActive:     { color:'#000', fontWeight:'700' },
  card:               { backgroundColor:'#141414', borderRadius:14, padding:14, borderWidth:1, borderColor:'#2A2A2A' },
  cardTop:            { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 },
  orderId:            { color:'#FFD700', fontSize:13, fontWeight:'700', fontFamily:'monospace' },
  customer:           { color:'#888', fontSize:11, marginTop:2 },
  statusBadge:        { paddingHorizontal:10, paddingVertical:4, borderRadius:20 },
  statusText:         { fontSize:11, fontWeight:'700' },
  cardMid:            { flexDirection:'row', justifyContent:'space-between', marginBottom:10 },
  items:              { color:'#CCC', fontSize:13 },
  amount:             { color:'#FFD700', fontSize:14, fontWeight:'700' },
  cardActions:        { flexDirection:'row', gap:8 },
  updateBtn:          { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, backgroundColor:'#FFD70020', paddingVertical:8, borderRadius:10 },
  updateBtnText:      { color:'#FFD700', fontSize:13, fontWeight:'600' },
  deleteBtn:          { width:36, height:36, backgroundColor:'#EF444420', borderRadius:10, justifyContent:'center', alignItems:'center' },
  empty:              { color:'#888', textAlign:'center', marginTop:40 },
  overlay:            { flex:1, backgroundColor:'#000000AA', justifyContent:'flex-end' },
  modal:              { backgroundColor:'#141414', borderTopLeftRadius:24, borderTopRightRadius:24, padding:20 },
  modalTitle:         { color:'#FFF', fontSize:17, fontWeight:'700', marginBottom:14 },
  modalLabel:         { color:'#888', fontSize:12, marginBottom:8 },
  statusOption:       { flexDirection:'row', alignItems:'center', gap:10, padding:10, borderRadius:10, marginBottom:6, backgroundColor:'#1E1E1E' },
  statusOptionActive: { backgroundColor:'#FFD70010', borderWidth:1, borderColor:'#FFD70050' },
  radioDot:           { width:12, height:12, borderRadius:6 },
  statusOptionText:   { fontSize:14, fontWeight:'600' },
  trackInput:         { backgroundColor:'#1E1E1E', color:'#FFF', borderRadius:10, padding:12, fontSize:14, marginBottom:12 },
  modalActions:       { flexDirection:'row', gap:10 },
  cancelBtn:          { flex:1, padding:14, borderRadius:12, backgroundColor:'#2A2A2A', alignItems:'center' },
  cancelText:         { color:'#888', fontWeight:'600' },
  saveBtn:            { flex:1, borderRadius:12, overflow:'hidden' },
  saveBtnGrad:        { padding:14, alignItems:'center' },
  saveText:           { color:'#000', fontWeight:'700' },
});
