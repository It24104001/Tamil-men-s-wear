import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Switch, Dimensions,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';

const { width } = Dimensions.get('window');

const MENU_SECTIONS = [
  {
    title: 'My Account',
    items: [
      { icon: 'receipt-outline',    label: 'Order History',     route: 'OrderHistory',   color: '#3B82F6' },
      { icon: 'location-outline',   label: 'Track Orders',      route: 'OrderHistory',   color: '#8B5CF6' },
      { icon: 'heart-outline',      label: 'My Wishlist',       route: 'Wishlist',       color: '#EF4444' },
      { icon: 'star-outline',       label: 'Loyalty Rewards',   route: 'Loyalty',        color: '#FFD700' },
    ],
  },
  {
    title: 'Shopping',
    items: [
      { icon: 'search-outline',     label: 'Search Products',   route: 'Search',         color: '#22C55E' },
      { icon: 'grid-outline',       label: 'Categories',        route: 'Categories',     color: '#F97316' },
      { icon: 'add-circle-outline', label: 'Request Product',   route: 'ProductRequest', color: '#06B6D4' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { icon: 'moon-outline',       label: 'Dark Mode',         route: 'theme',          color: '#A78BFA', isToggle: true },
      { icon: 'help-circle-outline',label: 'Help & Support',    route: null,             color: '#6B7280' },
      { icon: 'information-outline',label: 'About Us',          route: null,             color: '#6B7280' },
    ],
  },
];

export default function ProfileScreen({ navigation }) {
  const dispatch   = useDispatch();
  const { user }   = useSelector(s => s.auth);
  const { isDark } = useSelector(s => s.theme);
  const [profile,  setProfile]  = useState(null);
  const [orders,   setOrders]   = useState([]);

  const bg     = isDark ? '#0A0A0A' : '#F5F5F5';
  const cardBg = isDark ? '#141414' : '#FFFFFF';

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setProfile(res.data);
      const ordRes = await api.get(`/orders/user/${res.data._id || user?.id}`);
      setOrders(ordRes.data || []);
    } catch (e) { setProfile(user); }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive', onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'user']);
          dispatch(logout());
        }
      }
    ]);
  };

  const handleMenuPress = (item) => {
    if (item.isToggle) { dispatch(toggleTheme()); return; }
    if (item.route) { navigation.navigate(item.route); }
    else { Alert.alert('Coming Soon', 'This feature is coming soon!'); }
  };

  const pts      = profile?.loyaltyPoints || 0;
  const initials = (profile?.name || user?.name || 'U').slice(0, 2).toUpperCase();
  const totalOrders     = orders.length;
  const completedOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
  const totalSpent      = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1a1200', '#0A0A0A'] : ['#FFF9E6', '#F5F5F5']}
          style={styles.header}
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <LinearGradient colors={['#FFD700', '#B8960C']} style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <View>
              <Text style={[styles.name, { color: isDark ? '#FFF' : '#111' }]}>
                {profile?.name || user?.name || 'User'}
              </Text>
              <Text style={styles.email}>{profile?.email || user?.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{profile?.role?.toUpperCase() || 'USER'}</Text>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View style={[styles.statsRow, { backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]}>
            {[
              { label: 'Orders',    value: totalOrders },
              { label: 'Delivered', value: completedOrders },
              { label: 'Spent',     value: `₹${totalSpent > 0 ? (totalSpent/1000).toFixed(1)+'k' : 0}` },
              { label: 'Points',    value: pts },
            ].map((s, i) => (
              <View key={i} style={[styles.stat, i < 3 && { borderRightWidth: 1, borderRightColor: isDark ? '#2A2A2A' : '#EEE' }]}>
                <Text style={[styles.statVal, { color: isDark ? '#FFD700' : '#B8960C' }]}>{s.value}</Text>
                <Text style={styles.statLbl}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Loyalty badge */}
          {pts > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Loyalty')} style={styles.loyaltyBanner}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.loyaltyText}>
                You have <Text style={{ color: '#FFD700', fontWeight: '800' }}>{pts} loyalty points</Text> — Tap to redeem!
              </Text>
              <Icon name="chevron-forward" size={14} color="#FFD700" />
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#888' : '#999' }]}>
              {section.title.toUpperCase()}
            </Text>
            <View style={[styles.menuCard, { backgroundColor: cardBg }]}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[
                    styles.menuItem,
                    ii < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#2A2A2A' : '#F0F0F0' }
                  ]}
                  onPress={() => handleMenuPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                    <Icon name={item.icon} size={18} color={item.color} />
                  </View>
                  <Text style={[styles.menuLabel, { color: isDark ? '#FFF' : '#111' }]}>{item.label}</Text>
                  <View style={styles.menuRight}>
                    {item.isToggle
                      ? <Switch
                          value={isDark}
                          onValueChange={() => dispatch(toggleTheme())}
                          trackColor={{ false: '#767577', true: '#FFD70060' }}
                          thumbColor={isDark ? '#FFD700' : '#f4f3f4'}
                        />
                      : <Icon name="chevron-forward" size={16} color={isDark ? '#555' : '#CCC'} />
                    }
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>தமிழ் Men's Wear v1.0.0</Text>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header:         { padding: 20, paddingTop: 50, gap: 16 },
  avatarSection:  { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar:         { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center' },
  avatarText:     { color: '#000', fontSize: 24, fontWeight: '900' },
  name:           { fontSize: 20, fontWeight: '700' },
  email:          { color: '#888', fontSize: 13, marginTop: 2 },
  roleBadge:      { backgroundColor: '#FFD70020', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, alignSelf: 'flex-start', marginTop: 4 },
  roleText:       { color: '#FFD700', fontSize: 10, fontWeight: '700' },
  statsRow:       { flexDirection: 'row', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2A' },
  stat:           { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statVal:        { fontSize: 18, fontWeight: '800' },
  statLbl:        { color: '#888', fontSize: 10, marginTop: 2 },
  loyaltyBanner:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFD70015', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FFD70030' },
  loyaltyText:    { flex: 1, color: '#CCC', fontSize: 13 },
  section:        { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle:   { fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 },
  menuCard:       { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2A' },
  menuItem:       { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuIcon:       { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel:      { flex: 1, fontSize: 15 },
  menuRight:      {},
  logoutBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginBottom: 12, padding: 16, backgroundColor: '#EF444420', borderRadius: 14, borderWidth: 1, borderColor: '#EF444440' },
  logoutText:     { color: '#EF4444', fontWeight: '700', fontSize: 15 },
  version:        { color: '#555', fontSize: 11, textAlign: 'center', marginBottom: 8 },
});
