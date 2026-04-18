import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('token', res.data.token);
      dispatch(loginSuccess(res.data));
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.msg || 'Error occurred');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await api.post('/auth/google', { 
        email: 'mockgoogleuser@example.com', 
        name: 'Mock Google User',
        googleId: 'g-mock-123456789'
      });
      await AsyncStorage.setItem('token', res.data.token);
      dispatch(loginSuccess(res.data));
    } catch (error) {
      Alert.alert('Google Login Failed', error.response?.data?.msg || 'Error occurred');
    }
  };

  return (
    <LinearGradient colors={['#000000', '#1a1700', '#0a0a0a']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>TAMIL MEN'S WEAR</Text>
      <Text style={styles.subtitle}>EXCLUSIVE COLLECTION</Text>
      
      <View style={styles.inputWrapper}>
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#FFD700" value={email} onChangeText={setEmail} autoCapitalize="none"/>
      </View>
      <View style={styles.inputWrapper}>
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#FFD700" value={password} onChangeText={setPassword} secureTextEntry/>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>SIGN IN</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
        <Text style={styles.googleText}>SIGN IN WITH GOOGLE (MOCK)</Text>
      </TouchableOpacity>

      <Text style={styles.adminHint}>Admin? Use admin@tmw.com / admin123</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 25 },
  title: { fontSize: 36, fontWeight: '900', color: '#FFD700', textAlign: 'center', letterSpacing: 2, marginBottom: 5, textShadowColor: '#FFD700', textShadowOffset: {width: 0, height: 0}, textShadowRadius: 8 },
  subtitle: { fontSize: 13, color: '#FFD700', textAlign: 'center', marginBottom: 40, letterSpacing: 4, opacity: 0.8 },
  inputWrapper: { backgroundColor: 'rgba(0, 0, 0, 0.4)', borderWidth: 1, borderColor: '#FFD700', borderRadius: 4, marginBottom: 15 },
  input: { color: '#FFD700', padding: 15, fontSize: 16 },
  button: { backgroundColor: '#FFD700', padding: 15, borderRadius: 4, alignItems: 'center', marginTop: 10, shadowColor: '#FFD700', shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.6, shadowRadius: 15, elevation: 5 },
  buttonText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  googleBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FFD700', padding: 15, borderRadius: 4, alignItems: 'center', marginTop: 15 },
  googleText: { color: '#FFD700', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  adminHint: { color: '#666', textAlign: 'center', marginTop: 50, fontSize: 12, letterSpacing: 1 },
});
