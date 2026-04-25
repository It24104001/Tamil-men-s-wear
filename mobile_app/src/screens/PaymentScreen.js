import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import api from '../api/api';

const PAYMENT_METHODS = [
  { id: 'card',   label: 'Credit / Debit Card', icon: 'card-outline',         desc: 'Visa, Mastercard, Rupay' },
  { id: 'upi',    label: 'UPI Payment',          icon: 'phone-portrait-outline',desc: 'GPay, PhonePe, Paytm' },
  { id: 'cod',    label: 'Cash on Delivery',     icon: 'cash-outline',         desc: 'Pay when you receive' },
  { id: 'wallet', label: 'Loyalty Wallet',        icon: 'wallet-outline',       desc: 'Use your reward points' },
];

export default function PaymentScreen({ route, navigation }) {
  const { order, cartItems, totalAmount, shippingAddress } = route.params || {};
  const { user } = useSelector(s => s.auth);

  const [method,     setMethod]     = useState('card');
  const [processing, setProcessing] = useState(false);
  const [cardNum,    setCardNum]    = useState('');
  const [cardName,   setCardName]   = useState('');
  const [expiry,     setExpiry]     = useState('');
  const [cvv,        setCvv]        = useState('');
  const [upiId,      setUpiId]      = useState('');

  const formatCardNum = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };
  const formatExpiry = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) return `${cleaned.slice(0,2)}/${cleaned.slice(2)}`;
    return cleaned;
  };

  const handlePay = async () => {
    if (method === 'card') {
      if (cardNum.replace(/\s/g,'').length < 16) return Alert.alert('Enter 16-digit card number');
      if (!cardName.trim()) return Alert.alert('Enter cardholder name');
      if (expiry.length < 5)  return Alert.alert('Enter valid expiry (MM/YY)');
      if (cvv.length < 3)     return Alert.alert('Enter 3-digit CVV');
    }
    if (method === 'upi' && !upiId.includes('@')) {
      return Alert.alert('Enter valid UPI ID (e.g. user@bank)');
    }

    setProcessing(true);
    try {
      // 1) Create the order
      const orderPayload = {
        products:        cartItems || order?.products || [],
        totalAmount:     totalAmount || order?.totalAmount,
        shippingAddress: shippingAddress || order?.shippingAddress,
        paymentMethod:   method,
        paymentStatus:   method === 'cod' ? 'Pending' : 'Completed',
        orderStatus:     'Confirmed',
      };

      const orderRes = await api.post('/orders', orderPayload);
      const createdOrder = orderRes.data;

      // 2) Record payment
      if (method !== 'cod') {
        await api.post('/payments', {
          orderId:       createdOrder._id,
          amount:        totalAmount || order?.totalAmount,
          transactionId: `TXN${Date.now()}`,
          paymentMethod: method,
        });
      }

      // Success
      setProcessing(false);
      navigation.navigate('PaymentSuccess', {
        orderId:  createdOrder._id,
        amount:   totalAmount || order?.totalAmount,
        method:   method === 'cod' ? 'Cash on Delivery' : method.toUpperCase(),
        isCod:    method === 'cod',
      });
    } catch (e) {
      setProcessing(false);
      Alert.alert('Payment Failed', e.response?.data?.msg || 'Something went wrong. Please try again.');
    }
  };

  const amount = totalAmount || order?.totalAmount || 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={22} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.lockBadge}>
          <Icon name="lock-closed" size={14} color="#22C55E" />
          <Text style={styles.lockText}>Secure</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <LinearGradient colors={['#141414', '#1E1E1E']} style={styles.orderSummary}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{amount.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: '#22C55E' }]}>Free</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{amount.toLocaleString()}</Text>
          </View>
        </LinearGradient>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {PAYMENT_METHODS.map(pm => (
            <TouchableOpacity
              key={pm.id}
              style={[styles.methodCard, method === pm.id && styles.methodCardActive]}
              onPress={() => setMethod(pm.id)}
            >
              <View style={[styles.methodIcon, method === pm.id && styles.methodIconActive]}>
                <Icon name={pm.icon} size={22} color={method === pm.id ? '#000' : '#888'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodLabel, method === pm.id && styles.methodLabelActive]}>{pm.label}</Text>
                <Text style={styles.methodDesc}>{pm.desc}</Text>
              </View>
              <View style={[styles.radio, method === pm.id && styles.radioActive]}>
                {method === pm.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Card Form */}
        {method === 'card' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Card Details</Text>
            <View style={styles.formCard}>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                placeholderTextColor="#555"
                value={cardNum}
                onChangeText={v => setCardNum(formatCardNum(v))}
                keyboardType="numeric"
                maxLength={19}
              />
              <TextInput
                style={styles.input}
                placeholder="Cardholder Name"
                placeholderTextColor="#555"
                value={cardName}
                onChangeText={setCardName}
              />
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="MM/YY"
                  placeholderTextColor="#555"
                  value={expiry}
                  onChangeText={v => setExpiry(formatExpiry(v))}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="CVV"
                  placeholderTextColor="#555"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>
        )}

        {/* UPI Form */}
        {method === 'upi' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>UPI Details</Text>
            <View style={styles.formCard}>
              <TextInput
                style={styles.input}
                placeholder="Enter UPI ID (e.g. name@bank)"
                placeholderTextColor="#555"
                value={upiId}
                onChangeText={setUpiId}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <View style={styles.upiApps}>
                {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                  <TouchableOpacity key={app} style={styles.upiChip}>
                    <Text style={styles.upiChipText}>{app}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {method === 'cod' && (
          <View style={styles.codInfo}>
            <Icon name="information-circle-outline" size={18} color="#F59E0B" />
            <Text style={styles.codText}>Pay ₹{amount.toLocaleString()} in cash upon delivery. Please keep exact change.</Text>
          </View>
        )}

        {method === 'wallet' && (
          <View style={styles.codInfo}>
            <Icon name="wallet-outline" size={18} color="#FFD700" />
            <Text style={styles.codText}>
              Your loyalty points will be used as payment. 10 points = ₹1.
            </Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.payContainer}>
        <TouchableOpacity onPress={handlePay} disabled={processing} style={styles.payBtn}>
          <LinearGradient colors={['#FFD700', '#B8960C']} style={styles.payGrad}>
            {processing ? (
              <View style={styles.processingRow}>
                <ActivityIndicator size="small" color="#000" />
                <Text style={styles.payText}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.payText}>
                {method === 'cod' ? '📦 Place Order' : `💳 Pay ₹${amount.toLocaleString()}`}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.secureNote}>🔒 256-bit SSL encrypted. Your data is safe.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#0A0A0A' },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16, gap: 12 },
  backBtn:          { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle:      { color: '#FFF', fontSize: 20, fontWeight: '700', flex: 1 },
  lockBadge:        { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#22C55E20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  lockText:         { color: '#22C55E', fontSize: 11, fontWeight: '600' },
  orderSummary:     { marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#2A2A2A' },
  summaryTitle:     { color: '#FFF', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  summaryRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel:     { color: '#888', fontSize: 14 },
  summaryValue:     { color: '#FFF', fontSize: 14, fontWeight: '600' },
  totalRow:         { borderTopWidth: 1, borderTopColor: '#2A2A2A', marginTop: 8, paddingTop: 12 },
  totalLabel:       { color: '#FFF', fontSize: 16, fontWeight: '700' },
  totalValue:       { color: '#FFD700', fontSize: 18, fontWeight: '800' },
  section:          { marginHorizontal: 16, marginBottom: 16 },
  sectionTitle:     { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 10 },
  methodCard:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#141414', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2A2A2A' },
  methodCardActive: { borderColor: '#FFD700', backgroundColor: '#1a1200' },
  methodIcon:       { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center' },
  methodIconActive: { backgroundColor: '#FFD700' },
  methodLabel:      { color: '#CCC', fontSize: 14, fontWeight: '600' },
  methodLabelActive:{ color: '#FFD700' },
  methodDesc:       { color: '#666', fontSize: 12, marginTop: 2 },
  radio:            { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#444', justifyContent: 'center', alignItems: 'center' },
  radioActive:      { borderColor: '#FFD700' },
  radioDot:         { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFD700' },
  formCard:         { backgroundColor: '#141414', borderRadius: 14, padding: 16, gap: 10, borderWidth: 1, borderColor: '#2A2A2A' },
  input:            { backgroundColor: '#1E1E1E', color: '#FFF', borderRadius: 10, padding: 12, fontSize: 14 },
  inputRow:         { flexDirection: 'row', gap: 10 },
  upiApps:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  upiChip:          { backgroundColor: '#1E1E1E', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  upiChipText:      { color: '#CCC', fontSize: 12 },
  codInfo:          { flexDirection: 'row', gap: 10, marginHorizontal: 16, backgroundColor: '#F59E0B10', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#F59E0B30' },
  codText:          { color: '#CCC', fontSize: 13, flex: 1, lineHeight: 20 },
  payContainer:     { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0A0A0A', padding: 16, borderTopWidth: 1, borderTopColor: '#1E1E1E' },
  payBtn:           { borderRadius: 16, overflow: 'hidden', marginBottom: 8 },
  payGrad:          { padding: 18, alignItems: 'center' },
  processingRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payText:          { color: '#000', fontSize: 16, fontWeight: '800' },
  secureNote:       { color: '#555', fontSize: 11, textAlign: 'center' },
});
