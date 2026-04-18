import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart } from '../store/cartSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { t } from '../utils/i18n';
import api from '../api/api';

export default function CartScreen({ navigation }) {
  const { items, total } = useSelector(state => state.cart);
  const { user, language } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleRemove = async (item) => {
    dispatch(removeFromCart(item)); // Sync Local
    if(user) {
      try {
        await api.delete(`/cart/remove/${user._id || user.id}/${item._id || item.productId}`);
      } catch (err) { console.log('Cart sync error'); }
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.images?.[0] || item.image || 'https://via.placeholder.com/100' }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>Rs. {item.price}</Text>
        <Text style={styles.size}>SIZE: {item.selectedSize || item.sizes?.[0]}  |  QTY: {item.quantity}</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemove(item)} style={styles.removeBtn}>
        <Text style={styles.removeText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#0a0a0a', '#171300']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.header}>{t(language, 'yourCart').toUpperCase()}</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>{t(language, 'emptyCart')}</Text>
      ) : (
        <>
          <FlatList data={items} renderItem={renderItem} keyExtractor={(item, idx) => (item._id || idx.toString())} />
          <View style={styles.footer}>
            <Text style={styles.totalText}>{t(language, 'total')}: Rs. {total}</Text>
            <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate('Checkout')}>
              <Text style={styles.checkoutBtnText}>{t(language, 'checkout').toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { fontSize: 28, fontWeight: '900', color: '#FFD700', paddingHorizontal: 20, marginBottom: 20, letterSpacing: 2 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 50, fontSize: 16 },
  cartItem: { flexDirection: 'row', backgroundColor: 'rgba(255,215,0,0.05)', marginHorizontal: 20, marginBottom: 15, padding: 10, borderRadius: 4, borderWidth: 1, borderColor: '#FFD700', alignItems: 'center' },
  image: { width: 70, height: 70, borderRadius: 4 },
  details: { flex: 1, marginLeft: 15 },
  name: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  price: { color: '#FFD700', marginTop: 5, fontWeight: 'bold' },
  size: { color: '#aaa', fontSize: 11, marginTop: 5, letterSpacing: 1 },
  removeBtn: { padding: 10 },
  removeText: { color: '#FF0033', fontWeight: '900', fontSize: 18 },
  footer: { padding: 25, borderTopWidth: 1, borderColor: '#FFD700', backgroundColor: '#0a0a0a' },
  totalText: { color: '#FFD700', fontSize: 22, fontWeight: '900', marginBottom: 20 },
  checkoutBtn: { backgroundColor: '#FFD700', padding: 18, borderRadius: 4, alignItems: 'center', shadowColor: '#FFD700', shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  checkoutBtnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 }
});
