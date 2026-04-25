import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/Ionicons';

export default function PaymentSuccessScreen({ route, navigation }) {
  const { orderId, amount, method, isCod } = route.params || {};
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#0A0A0A', '#071a07', '#0A0A0A']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Success Icon */}
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient colors={['#22C55E', '#16a34a']} style={styles.iconCircle}>
          <Icon name="checkmark" size={56} color="#FFF" />
        </LinearGradient>
        <View style={styles.iconGlow} />
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>{isCod ? 'Order Placed! 📦' : 'Payment Successful! 🎉'}</Text>
        <Text style={styles.subtitle}>
          {isCod
            ? 'Your order has been placed.\nPay when you receive it.'
            : 'Your payment was processed\nsuccessfully.'
          }
        </Text>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID</Text>
            <Text style={styles.detailValue}>#{orderId?.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={[styles.detailValue, { color: '#FFD700' }]}>₹{amount?.toLocaleString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment</Text>
            <Text style={styles.detailValue}>{method}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{isCod ? 'Pending' : 'Paid'}</Text>
            </View>
          </View>
        </View>

        {/* Loyalty note */}
        {!isCod && (
          <View style={styles.loyaltyNote}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.loyaltyText}>
              You earned {Math.floor((amount || 0) / 100)} loyalty points!
            </Text>
          </View>
        )}

        {/* Actions */}
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => navigation.navigate('OrderTracking', { orderId })}
        >
          <LinearGradient colors={['#FFD700', '#B8960C']} style={styles.trackGrad}>
            <Icon name="location-outline" size={18} color="#000" />
            <Text style={styles.trackText}>Track Order</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.homeBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconContainer:  { alignItems: 'center', marginBottom: 32, position: 'relative' },
  iconCircle:     { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  iconGlow:       { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: '#22C55E15', top: -20 },
  content:        { width: '100%', alignItems: 'center', gap: 16 },
  title:          { color: '#FFF', fontSize: 26, fontWeight: '800', textAlign: 'center' },
  subtitle:       { color: '#888', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  detailsCard:    { width: '100%', backgroundColor: '#141414', borderRadius: 16, padding: 20, gap: 4, borderWidth: 1, borderColor: '#2A2A2A' },
  detailRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1E1E1E' },
  detailLabel:    { color: '#888', fontSize: 14 },
  detailValue:    { color: '#FFF', fontSize: 14, fontWeight: '600' },
  statusBadge:    { backgroundColor: '#22C55E20', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10 },
  statusText:     { color: '#22C55E', fontSize: 12, fontWeight: '600' },
  loyaltyNote:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFD70015', padding: 12, borderRadius: 12 },
  loyaltyText:    { color: '#FFD700', fontSize: 13, fontWeight: '600' },
  trackBtn:       { width: '100%', borderRadius: 14, overflow: 'hidden' },
  trackGrad:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 },
  trackText:      { color: '#000', fontSize: 16, fontWeight: '700' },
  homeBtn:        { paddingVertical: 14 },
  homeBtnText:    { color: '#888', fontSize: 14 },
});
