import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, StatusBar, KeyboardAvoidingView, Platform,
  ScrollView, Animated, ActivityIndicator, Dimensions
} from 'react-native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { validateEmail } from '../utils/validation';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const dispatch  = useDispatch();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const [isLogin,  setIsLogin]  = useState(true);
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  // Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '723323923061-jt9a43a1i39t90gusibmeq45edvg1odk.apps.googleusercontent.com',
    webClientId:     '723323923061-edh5ggjvgu34he3f9hivrjr208oh0ksh.apps.googleusercontent.com',
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleToken(response.authentication.accessToken);
    } else if (response?.type === 'error') {
      showAlert('Google Sign-In Failed', response.error?.message || 'Authorization was cancelled or failed.');
    }
  }, [response]);

  const showAlert = (title, msg) => {
    if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`);
    else Alert.alert(title, msg);
  };

  const handleGoogleToken = async (accessToken) => {
    try {
      setLoading(true);
      const googleRes  = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const googleUser = await googleRes.json();
      if (!googleUser.email) throw new Error('Could not fetch your Google account details.');

      const res = await api.post('/auth/google', {
        email:    googleUser.email,
        name:     googleUser.name || 'Google User',
        googleId: googleUser.id,
      });
      await AsyncStorage.setItem('token', res.data.token);
      dispatch(loginSuccess(res.data));
    } catch (err) {
      showAlert('Google Auth Failed', err.response?.data?.msg || err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!isLogin && !name.trim()) return showAlert('Validation Error', 'Please enter your full name.');
    if (!validateEmail(email))     return showAlert('Validation Error', 'Please enter a valid email address.');
    if (password.length < 6)       return showAlert('Validation Error', 'Password must be at least 6 characters.');

    try {
      setLoading(true);
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload  = isLogin ? { email, password } : { name, email, password };
      const res      = await api.post(endpoint, payload);
      await AsyncStorage.setItem('token', res.data.token);
      dispatch(loginSuccess(res.data));
    } catch (err) {
      showAlert(isLogin ? 'Login Failed' : 'Registration Failed', err.response?.data?.msg || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setName(''); setEmail(''); setPassword('');
    // Re-animate
    fadeAnim.setValue(0.6); slideAnim.setValue(10);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  return (
    <LinearGradient colors={['#000000', '#0d0d0d', '#111111']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── BRAND HEADER ── */}
          <Animated.View style={[styles.brand, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.brandTamil}>தமிழ்</Text>
            <Text style={styles.brandEn}>MEN'S WEAR</Text>
            <View style={styles.brandLine} />
            <Text style={styles.brandSub}>EXCLUSIVE COLLECTION 2026</Text>
          </Animated.View>

          {/* ── MODE TOGGLE ── */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, isLogin && styles.toggleActive]}
                onPress={() => !isLogin && switchMode()}
              >
                <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>SIGN IN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, !isLogin && styles.toggleActive]}
                onPress={() => isLogin && switchMode()}
              >
                <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>REGISTER</Text>
              </TouchableOpacity>
            </View>

            {/* ── FORM ── */}
            {!isLogin && (
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#444"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputWrap}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#444"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password (min 6 chars)"
                placeholderTextColor="#444"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* ── SUBMIT ── */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitDisabled]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#000" />
                : <Text style={styles.submitText}>{isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}</Text>
              }
            </TouchableOpacity>

            {/* ── DIVIDER ── */}
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            {/* ── GOOGLE ── */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  showAlert(
                    'Google Sign-In — Expo Go Limitation',
                    'Google Sign-In is blocked inside Expo Go by Google\'s security policy.\n\nPlease use Email/Password above to login, or open this app in a Web Browser (press W in terminal) to use Google Sign-In.'
                  );
                } else {
                  promptAsync();
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.googleText}>🔵  CONTINUE WITH GOOGLE</Text>
            </TouchableOpacity>

            {/* ── HINT ── */}
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>🔐 Admin Login: admin@tmw.com / admin123</Text>
            </View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  scroll:           { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 60, paddingBottom: 40 },

  // Brand
  brand:            { alignItems: 'center', marginBottom: 40 },
  brandTamil:       { fontSize: 52, fontWeight: '900', color: '#FFD700', letterSpacing: 2, textShadowColor: 'rgba(255,215,0,0.4)', textShadowRadius: 20 },
  brandEn:          { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 6, marginTop: -8 },
  brandLine:        { width: 48, height: 3, backgroundColor: '#FFD700', marginVertical: 16, borderRadius: 2 },
  brandSub:         { fontSize: 10, color: '#666', letterSpacing: 3, fontWeight: '700' },

  // Card
  card:             { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,215,0,0.12)' },

  // Toggle
  toggleRow:        { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 14, padding: 4, marginBottom: 28 },
  toggleBtn:        { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  toggleActive:     { backgroundColor: '#FFD700' },
  toggleText:       { color: '#666', fontWeight: '800', fontSize: 13, letterSpacing: 1.5 },
  toggleTextActive: { color: '#000' },

  // Inputs
  inputWrap:        { marginBottom: 16 },
  label:            { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  input:            { backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 14, fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,215,0,0.15)' },

  // Submit
  submitBtn:        { backgroundColor: '#FFD700', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: '#FFD700', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  submitDisabled:   { opacity: 0.6 },
  submitText:       { color: '#000', fontWeight: '900', fontSize: 15, letterSpacing: 2 },

  // Divider
  dividerRow:       { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divider:          { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  dividerText:      { color: '#555', marginHorizontal: 12, fontSize: 12, fontWeight: '700' },

  // Google
  googleBtn:        { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  googleText:       { color: '#ddd', fontWeight: '700', fontSize: 13, letterSpacing: 1 },

  // Hint
  hintBox:          { marginTop: 20, padding: 12, backgroundColor: 'rgba(255,215,0,0.06)', borderRadius: 10, alignItems: 'center' },
  hintText:         { color: '#888', fontSize: 11, letterSpacing: 0.5 },
});
