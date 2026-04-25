import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Linking, Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

const STATUS_STEPS = ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

const STATUS_ICONS = {
  'Pending':          { icon: 'time-outline',          color: '#F59E0B' },
  'Confirmed':        { icon: 'checkmark-circle-outline',color: '#3B82F6' },
  'Shipped':          { icon: 'cube-outline',          color: '#8B5CF6' },
  'Out for Delivery': { icon: 'bicycle-outline',       color: '#F97316' },
  'Delivered':        { icon: 'checkmark-done-circle',  color: '#22C55E' },
  'Cancelled':        { icon: 'close-circle-outline',  color: '#EF4444' },
};

export default function OrderTrackingScreen({ route, navigation }) {
  const { orderId, order: initialOrder } = route.params || {};
  const [order,   setOrder]   = useState(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder);

  useEffect(() => {
    if (!initialOrder && orderId) fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (e) { Alert.alert('Error', 'Could not load order details'); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#FFD700" />
    </View>
  );
  if (!order) return (
    <View style={styles.loading}>
      <Text style={styles.errorText}>Order not found</Text>
    </View>
  );

  const currentStepIndex = STATUS_STEPS.indexOf(order.orderStatus);
  const statusInfo = STATUS_ICONS[order.orderStatus] || STATUS_ICONS['Pending'];
  const isCancelled = order.orderStatus === 'Cancelled';

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={22} color="#FFD700" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.headerSub}>#{order._id?.slice(-8).toUpperCase()}</Text>
        </View>
        <TouchableOpacity onPress={fetchOrder} style={styles.refreshBtn}>
          <Icon name="refresh" size={22} color="#FFD700" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <LinearGradient colors={['#141414', '#1E1E1E']} style={styles.statusCard}>
          <View style={styles.statusIconRow}>
            <View style={[styles.statusIconBg, { backgroundColor: statusInfo.color + '20' }]}>
              <Icon name={statusInfo.icon} size={36} color={statusInfo.color} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.statusLabel}>Current Status</Text>
              <Text style={[styles.statusValue, { color: statusInfo.color }]}>{order.orderStatus}</Text>
              <Text style={styles.statusDate}>Updated: {formatDate(order.updatedAt)}</Text>
            </View>
          </View>

          {order.trackingNumber && (
            <View style={styles.trackingRow}>
              <Icon name="barcode-outline" size={16} color="#FFD700" />
              <Text style={styles.trackingText}>Tracking: {order.trackingNumber}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Progress Timeline */}
        {!isCancelled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Progress</Text>
            <View style={styles.timeline}>
              {STATUS_STEPS.map((step, i) => {
                const isDone    = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                const stepInfo  = STATUS_ICONS[step] || STATUS_ICONS['Pending'];
                return (
                  <View key={step} style={styles.timelineRow}>
                    <View style={styles.timelineLeft}>
                      <View style={[
                        styles.timelineDot,
                        isDone && styles.timelineDotDone,
                        isCurrent && styles.timelineDotCurrent,
                      ]}>
                        {isDone
                          ? <Icon name="checkmark" size={12} color="#000" />
                          : <View style={styles.timelineDotInner} />
                        }
                      </View>
                      {i < STATUS_STEPS.length - 1 && (
                        <View style={[styles.timelineLine, isDone && styles.timelineLineDone]} />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[styles.stepName, isDone && styles.stepNameDone]}>{step}</Text>
                      {isCurrent && (
                        <Text style={styles.stepCurrent}>● In Progress</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          {(order.products || []).map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={styles.itemIcon}><Text style={styles.itemEmoji}>👔</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name || item.productId?.name || 'Product'}</Text>
                <Text style={styles.itemMeta}>
                  {item.selectedSize ? `Size: ${item.selectedSize} • ` : ''}Qty: {item.quantity}
                </Text>
              </View>
              <Text style={styles.itemPrice}>₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <Icon name="location-outline" size={18} color="#FFD700" />
            <Text style={styles.addressText}>{order.shippingAddress || 'Not specified'}</Text>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Method</Text>
              <Text style={styles.summaryValue}>{order.paymentMethod?.toUpperCase() || 'CARD'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Status</Text>
              <Text style={[styles.summaryValue, { color: order.paymentStatus === 'Completed' ? '#22C55E' : '#F59E0B' }]}>
                {order.paymentStatus || 'Pending'}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{order.totalAmount?.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#0A0A0A' },
  loading:              { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
  errorText:            { color: '#EF4444', fontSize: 16 },
  header:               { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16, gap: 12 },
  backBtn:              { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle:          { color: '#FFF', fontSize: 18, fontWeight: '700' },
  headerSub:            { color: '#FFD700', fontSize: 12, fontFamily: 'monospace' },
  refreshBtn:           { marginLeft: 'auto', width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  statusCard:           { marginHorizontal: 16, borderRadius: 16, padding: 20, marginBottom: 8, borderWidth: 1, borderColor: '#2A2A2A' },
  statusIconRow:        { flexDirection: 'row', alignItems: 'center' },
  statusIconBg:         { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  statusLabel:          { color: '#888', fontSize: 12 },
  statusValue:          { fontSize: 20, fontWeight: '700', marginTop: 2 },
  statusDate:           { color: '#555', fontSize: 11, marginTop: 2 },
  trackingRow:          { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: '#FFD70010', padding: 10, borderRadius: 8 },
  trackingText:         { color: '#FFD700', fontSize: 13, fontFamily: 'monospace' },
  section:              { marginHorizontal: 16, marginTop: 20 },
  sectionTitle:         { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  timeline:             { paddingLeft: 8 },
  timelineRow:          { flexDirection: 'row', marginBottom: 0 },
  timelineLeft:         { alignItems: 'center', marginRight: 16, width: 24 },
  timelineDot:          { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2A2A2A', borderWidth: 2, borderColor: '#444', justifyContent: 'center', alignItems: 'center' },
  timelineDotDone:      { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  timelineDotCurrent:   { borderColor: '#FFD700', borderWidth: 3 },
  timelineDotInner:     { width: 8, height: 8, borderRadius: 4, backgroundColor: '#444' },
  timelineLine:         { width: 2, flex: 1, backgroundColor: '#2A2A2A', marginVertical: 4, minHeight: 32 },
  timelineLineDone:     { backgroundColor: '#FFD700' },
  timelineContent:      { flex: 1, paddingBottom: 24 },
  stepName:             { color: '#666', fontSize: 14 },
  stepNameDone:         { color: '#FFF', fontWeight: '600' },
  stepCurrent:          { color: '#FFD700', fontSize: 11, marginTop: 2 },
  itemRow:              { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#141414', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#2A2A2A' },
  itemIcon:             { width: 44, height: 44, backgroundColor: '#1E1E1E', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  itemEmoji:            { fontSize: 22 },
  itemName:             { color: '#FFF', fontSize: 14, fontWeight: '600' },
  itemMeta:             { color: '#888', fontSize: 12, marginTop: 2 },
  itemPrice:            { color: '#FFD700', fontWeight: '700', fontSize: 14 },
  addressCard:          { flexDirection: 'row', gap: 10, backgroundColor: '#141414', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2A2A2A' },
  addressText:          { color: '#CCC', fontSize: 14, flex: 1, lineHeight: 20 },
  summaryCard:          { backgroundColor: '#141414', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2A2A2A' },
  summaryRow:           { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  summaryLabel:         { color: '#888', fontSize: 14 },
  summaryValue:         { color: '#FFF', fontSize: 14, fontWeight: '600' },
  totalRow:             { borderBottomWidth: 0, paddingTop: 12 },
  totalLabel:           { color: '#FFF', fontSize: 16, fontWeight: '700' },
  totalValue:           { color: '#FFD700', fontSize: 18, fontWeight: '800' },
});
