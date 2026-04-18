import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setLanguage } from '../store/authSlice';
import { t } from '../utils/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const { user, language } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    dispatch(logout());
  };

  const toggleLang = () => {
    dispatch(setLanguage(language === 'en' ? 'ta' : 'en'));
  };

  return (
    <LinearGradient colors={['#0a0a0a', '#171300']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.header}>{t(language, 'profile').toUpperCase()}</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>{t(language, 'name').toUpperCase()}</Text>
        <Text style={styles.value}>{user?.name}</Text>
        
        <Text style={styles.label}>{t(language, 'email').toUpperCase()}</Text>
        <Text style={styles.value}>{user?.email}</Text>

        <Text style={styles.label}>{t(language, 'loyaltyPoints').toUpperCase()}</Text>
        <Text style={styles.points}>{user?.loyaltyPoints || 0}</Text>
      </View>

      <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Wishlist')}>
        <Text style={styles.btnSecondaryText}>WISHLIST</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('OrderHistory')}>
        <Text style={styles.btnSecondaryText}>ORDER HISTORY</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSecondary} onPress={toggleLang}>
        <Text style={styles.btnSecondaryText}>{t(language, 'language').toUpperCase()}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={handleLogout}>
        <Text style={styles.btnText}>{t(language, 'logout').toUpperCase()}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, paddingTop: 60 },
  header: { fontSize: 32, fontWeight: '900', color: '#FFD700', marginBottom: 30, letterSpacing: 2 },
  card: { backgroundColor: 'rgba(255,215,0,0.05)', padding: 25, borderRadius: 4, marginBottom: 30, borderWidth: 1, borderColor: '#FFD700' },
  label: { color: '#FFD700', fontSize: 11, marginTop: 15, opacity: 0.8, letterSpacing: 1 },
  value: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  points: { color: '#FFD700', fontSize: 36, fontWeight: '900', marginTop: 5, textShadowColor: '#FFD700', textShadowRadius: 10 },
  btnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FFD700', padding: 15, borderRadius: 4, alignItems: 'center', marginBottom: 15 },
  btnSecondaryText: { color: '#FFD700', fontWeight: '900', fontSize: 15, letterSpacing: 1 },
  btn: { backgroundColor: '#FFD700', padding: 15, borderRadius: 4, alignItems: 'center', shadowColor: '#FFD700', shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
  btnText: { color: '#000', fontWeight: '900', fontSize: 15, letterSpacing: 2 }
});
