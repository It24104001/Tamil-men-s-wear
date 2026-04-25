import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import api from '../api/api';

const TIERS = [
  { name: 'Bronze',   minPoints: 0,    color: '#CD7F32', emoji: '🥉', perks: ['5% discount on orders', 'Birthday bonus points'] },
  { name: 'Silver',   minPoints: 500,  color: '#C0C0C0', emoji: '🥈', perks: ['10% discount on orders', 'Free shipping over ₹1500', 'Priority support'] },
  { name: 'Gold',     minPoints: 1500, color: '#FFD700', emoji: '🥇', perks: ['15% discount on orders', 'Free shipping always', 'Early access to sales'] },
  { name: 'Platinum', minPoints: 5000, color: '#E5E4E2', emoji: '💎', perks: ['20% discount on orders', 'Free express delivery', 'Exclusive products', 'Personal stylist'] },
];

export default function LoyaltyScreen({ navigation }) {
  const { user }     = useSelector(s => s.auth);
  const [profile,    setProfile]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [redeeming,  setRedeeming]  = useState(false);
  const [redeemAmt,  setRedeemAmt]  = useState('');
  const [showRedeem, setShowRedeem] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/auth/me`);
      setProfile(res.data);
    } catch (e) {
      // fallback to Redux user data
      setProfile(user);
    } finally { setLoading(false); }
  };

  const points        = profile?.loyaltyPoints || 0;
  const currentTier   = TIERS.filter(t => points >= t.minPoints).pop() || TIERS[0];
  const nextTier      = TIERS.find(t => t.minPoints > points);
  const progressPct   = nextTier ? Math.min((points / nextTier.minPoints) * 100, 100) : 100;
  const pointsToNext  = nextTier ? nextTier.minPoints - points : 0;

  const handleRedeem = async () => {
    const amt = parseInt(redeemAmt);
    if (!amt || amt <= 0 || amt > points) {
      Alert.alert('Invalid', `Enter a valid amount (max ${points} points)`);
      return;
    }
    Alert.alert('Redeem Points', `Convert ${amt} points to ₹${Math.floor(amt / 10)} discount?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Redeem', onPress: async () => {
          setRedeeming(true);
          try {
            // API call — deduct loyalty points
            await api.put('/auth/profile', { loyaltyPoints: points - amt });
            setProfile(prev => ({ ...prev, loyaltyPoints: points - amt }));
            setRedeemAmt('');
            setShowRedeem(false);
            Alert.alert('Success! 🎉', `You've earned ₹${Math.floor(amt / 10)} discount on your next order!`);
          } catch (e) { Alert.alert('Error', 'Could not redeem points'); }
          finally { setRedeeming(false); }
        }
      }
    ]);
  };

  if (loading) return (
    <View style={styles.loading}><ActivityIndicator size="large" color="#FFD700" /></View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={22} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loyalty Rewards</Text>
        <Text style={styles.headerTa}>விசுவாச பரிசுகள்</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Points Hero */}
        <LinearGradient colors={['#1a1200', '#2a1f00', '#0A0A0A']} style={styles.hero}>
          <Text style={styles.heroBadge}>{currentTier.emoji} {currentTier.name} Member</Text>
          <Text style={styles.heroPoints}>{points.toLocaleString()}</Text>
          <Text style={styles.heroLabel}>Total Points</Text>
          <Text style={styles.heroSub}>= ₹{Math.floor(points / 10)} cashback value</Text>

          {/* Progress bar */}
          {nextTier && (
            <View style={styles.progressSection}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>{currentTier.name}</Text>
                <Text style={styles.progressLabel}>{nextTier.name} ({nextTier.minPoints} pts)</Text>
              </View>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={['#FFD700', '#B8960C']}
                  style={[styles.progressFill, { width: `${progressPct}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={styles.progressNote}>{pointsToNext} more points to {nextTier.name}</Text>
            </View>
          )}
        </LinearGradient>

        {/* How to Earn */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Earn Points</Text>
          {[
            { icon: '🛍️', label: 'Every ₹100 spent',  pts: '+1 pt' },
            { icon: '⭐', label: 'Write a review',     pts: '+10 pts' },
            { icon: '👥', label: 'Refer a friend',     pts: '+50 pts' },
            { icon: '📱', label: 'Daily app login',    pts: '+2 pts' },
            { icon: '🎂', label: 'Birthday bonus',     pts: '+100 pts' },
          ].map((item, i) => (
            <View key={i} style={styles.earnRow}>
              <Text style={styles.earnEmoji}>{item.icon}</Text>
              <Text style={styles.earnLabel}>{item.label}</Text>
              <View style={styles.earnBadge}>
                <Text style={styles.earnPts}>{item.pts}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Redeem Points */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redeem Points</Text>
          <View style={styles.redeemCard}>
            <Text style={styles.redeemInfo}>10 points = ₹1 discount on your order</Text>
            <TouchableOpacity
              style={styles.redeemToggle}
              onPress={() => setShowRedeem(!showRedeem)}
            >
              <LinearGradient colors={['#FFD700', '#B8960C']} style={styles.redeemBtn}>
                <Icon name="gift-outline" size={18} color="#000" />
                <Text style={styles.redeemBtnText}>Redeem Now</Text>
              </LinearGradient>
            </TouchableOpacity>
            {showRedeem && (
              <View style={styles.redeemInput}>
                <TextInput
                  style={styles.input}
                  placeholder={`Enter points (max ${points})`}
                  placeholderTextColor="#666"
                  value={redeemAmt}
                  onChangeText={setRedeemAmt}
                  keyboardType="numeric"
                />
                {redeemAmt.length > 0 && (
                  <Text style={styles.redeemPreview}>
                    = ₹{Math.floor(parseInt(redeemAmt || 0) / 10)} discount
                  </Text>
                )}
                <TouchableOpacity style={styles.confirmBtn} onPress={handleRedeem} disabled={redeeming}>
                  {redeeming
                    ? <ActivityIndicator size="small" color="#000" />
                    : <Text style={styles.confirmBtnText}>Confirm Redemption</Text>
                  }
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Tier Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membership Tiers</Text>
          {TIERS.map((tier, i) => (
            <View key={tier.name} style={[styles.tierCard, currentTier.name === tier.name && styles.tierCardActive]}>
              <View style={styles.tierHeader}>
                <Text style={styles.tierEmoji}>{tier.emoji}</Text>
                <View>
                  <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
                  <Text style={styles.tierPts}>{tier.minPoints.toLocaleString()}+ points</Text>
                </View>
                {currentTier.name === tier.name && (
                  <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>Current</Text></View>
                )}
              </View>
              {tier.perks.map((perk, j) => (
                <View key={j} style={styles.perkRow}>
                  <Icon name="checkmark-circle" size={14} color={tier.color} />
                  <Text style={styles.perkText}>{perk}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#0A0A0A' },
  loading:          { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
  header:           { paddingHorizontal: 16, paddingTop: 50, paddingBottom: 8 },
  backBtn:          { marginBottom: 8 },
  headerTitle:      { color: '#FFF', fontSize: 24, fontWeight: '800' },
  headerTa:         { color: '#FFD700', fontSize: 14, marginTop: 2 },
  hero:             { marginHorizontal: 16, marginVertical: 16, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#2A2A2A' },
  heroBadge:        { color: '#FFD700', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  heroPoints:       { color: '#FFD700', fontSize: 56, fontWeight: '900', lineHeight: 60 },
  heroLabel:        { color: '#888', fontSize: 14 },
  heroSub:          { color: '#FFF', fontSize: 16, fontWeight: '600', marginTop: 4 },
  progressSection:  { marginTop: 20 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel:    { color: '#888', fontSize: 11 },
  progressBar:      { height: 8, backgroundColor: '#2A2A2A', borderRadius: 4, overflow: 'hidden' },
  progressFill:     { height: '100%', borderRadius: 4 },
  progressNote:     { color: '#888', fontSize: 11, marginTop: 6, textAlign: 'center' },
  section:          { marginHorizontal: 16, marginBottom: 20 },
  sectionTitle:     { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  earnRow:          { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#141414', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2A2A2A' },
  earnEmoji:        { fontSize: 24, width: 32 },
  earnLabel:        { flex: 1, color: '#CCC', fontSize: 14 },
  earnBadge:        { backgroundColor: '#FFD70020', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  earnPts:          { color: '#FFD700', fontSize: 13, fontWeight: '700' },
  redeemCard:       { backgroundColor: '#141414', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2A2A2A', gap: 12 },
  redeemInfo:       { color: '#888', fontSize: 13, textAlign: 'center' },
  redeemToggle:     { alignItems: 'center' },
  redeemBtn:        { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  redeemBtnText:    { color: '#000', fontWeight: '700', fontSize: 15 },
  redeemInput:      { gap: 8 },
  input:            { backgroundColor: '#1E1E1E', color: '#FFF', borderRadius: 10, padding: 12, fontSize: 15 },
  redeemPreview:    { color: '#FFD700', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  confirmBtn:       { backgroundColor: '#22C55E', borderRadius: 10, padding: 14, alignItems: 'center' },
  confirmBtnText:   { color: '#FFF', fontWeight: '700', fontSize: 15 },
  tierCard:         { backgroundColor: '#141414', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A2A' },
  tierCardActive:   { borderColor: '#FFD700', backgroundColor: '#1a1200' },
  tierHeader:       { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  tierEmoji:        { fontSize: 28 },
  tierName:         { fontSize: 18, fontWeight: '700' },
  tierPts:          { color: '#888', fontSize: 12 },
  currentBadge:     { marginLeft: 'auto', backgroundColor: '#FFD70020', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  currentBadgeText: { color: '#FFD700', fontSize: 11, fontWeight: '700' },
  perkRow:          { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  perkText:         { color: '#CCC', fontSize: 13 },
});
