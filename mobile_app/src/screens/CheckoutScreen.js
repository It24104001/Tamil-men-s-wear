import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, StatusBar, TextInput, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';
import { validateEmail, validatePhone, isNotEmpty } from '../utils/validation';

export default function CheckoutScreen({ navigation }) {
  const { items, total } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [shippingDetails, setShippingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handlePayment = async () => {
    // Validations
    if (!isNotEmpty(shippingDetails.name) || !isNotEmpty(shippingDetails.address)) {
      return Alert.alert('Validation Error', 'Name and Address are required.');
    }
    if (!validateEmail(shippingDetails.email)) {
      return Alert.alert('Validation Error', 'Please enter a valid email address.');
    }
    if (!validatePhone(shippingDetails.phone)) {
      return Alert.alert('Validation Error', 'Phone number must be exactly 10 digits.');
    }

    setLoading(true);
    try {
      const formatProducts = items.map(item => ({ productId: item._id, quantity: item.quantity, size: item.selectedSize, price: item.price }));
      const orderRes = await api.post('/orders/create', { products: formatProducts, totalAmount: total, shippingDetails });
      
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
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <Text style={styles.header}>CHECKOUT</Text>
        
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>TOTAL ITEMS: {items.reduce((acc, item) => acc + item.quantity, 0)}</Text>
          <Text style={styles.summaryText}>TOTAL AMOUNT: Rs. {total}</Text>
        </View>

        <Text style={styles.subHeader}>SHIPPING DETAILS</Text>
        
        <TextInput 
          style={styles.input} 
          placeholder="Full Name" 
          placeholderTextColor="#666"
          value={shippingDetails.name}
          onChangeText={t => setShippingDetails({...shippingDetails, name: t})}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Email Address" 
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          value={shippingDetails.email}
          onChangeText={t => setShippingDetails({...shippingDetails, email: t})}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Phone Number (10 digits)" 
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          maxLength={10}
          value={shippingDetails.phone}
          onChangeText={t => setShippingDetails({...shippingDetails, phone: t})}
        />
        <TextInput 
          style={[styles.input, { height: 100 }]} 
          placeholder="Full Delivery Address" 
          placeholderTextColor="#666"
          multiline
          textAlignVertical="top"
          value={shippingDetails.address}
          onChangeText={t => setShippingDetails({...shippingDetails, address: t})}
        />

        <TouchableOpacity style={styles.payBtn} onPress={handlePayment} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.payBtnText}>PAY WITH CARD (SANDBOX)</Text>}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, paddingTop: 60 },
  header: { fontSize: 26, fontWeight: '900', color: '#FFD700', marginBottom: 20, letterSpacing: 2 },
  subHeader: { fontSize: 14, fontWeight: 'bold', color: '#FFD700', marginBottom: 15, letterSpacing: 1 },
  summaryBox: { backgroundColor: 'rgba(255,215,0,0.05)', padding: 25, borderRadius: 12, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
  summaryText: { color: '#fff', fontSize: 16, marginBottom: 10, fontWeight: 'bold', letterSpacing: 1 },
  input: { backgroundColor: '#111', color: '#fff', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#332b00', marginBottom: 15, fontSize: 15 },
  payBtn: { backgroundColor: '#FFD700', padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#FFD700', shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  payBtnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 }
});
