import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

export default function CheckoutScreen({ navigation }) {
  const { items, total } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const formatProducts = items.map(item => ({ productId: item._id, quantity: item.quantity, size: item.selectedSize, price: item.price }));
      const orderRes = await api.post('/orders/create', { products: formatProducts, totalAmount: total });
      
      const paymentRes = await api.post('/payment/create-intent', { amount: total, orderId: orderRes.data._id });
      await api.post('/payment/confirm', { orderId: orderRes.data._id, transactionId: paymentRes.data.clientSecret, amount: total });
      
      dispatch(clearCart());
      Alert.alert('Payment Successful', 'Your order has been placed successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (err) {
      console.log(err);
      Alert.alert('Payment Failed', 'Something went wrong during the checkout process.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0a0a0a', '#171300']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.header}>ORDER SUMMARY</Text>
      
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>TOTAL ITEMS: {items.reduce((acc, item) => acc + item.quantity, 0)}</Text>
        <Text style={styles.summaryText}>TOTAL AMOUNT: Rs. {total}</Text>
      </View>

      <TouchableOpacity style={styles.payBtn} onPress={handlePayment} disabled={loading}>
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.payBtnText}>PAY WITH CARD (SANDBOX)</Text>}
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, paddingTop: 60 },
  header: { fontSize: 26, fontWeight: '900', color: '#FFD700', marginBottom: 30, letterSpacing: 2 },
  summaryBox: { backgroundColor: 'rgba(255,215,0,0.05)', padding: 25, borderRadius: 4, marginBottom: 40, borderWidth: 1, borderColor: '#FFD700' },
  summaryText: { color: '#fff', fontSize: 16, marginBottom: 15, fontWeight: 'bold', letterSpacing: 1 },
  payBtn: { backgroundColor: '#FFD700', padding: 18, borderRadius: 4, alignItems: 'center', shadowColor: '#FFD700', shadowOffset: {width:0, height:0}, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  payBtnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 }
});
