import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0.3)).current;
  const slideAnim  = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      ]),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(async () => {
      const onboarded = await AsyncStorage.getItem('onboarded');
      navigation.replace(onboarded ? 'Login' : 'Onboarding');
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={['#0A0A0A', '#1a1200', '#0A0A0A']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Glowing orb background */}
      <View style={styles.orb} />

      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Crown icon */}
        <Text style={styles.crown}>♔</Text>

        {/* Tamil brand name */}
        <Text style={styles.tamilText}>தமிழ்</Text>
        <Text style={styles.brandText}>MEN'S WEAR</Text>

        {/* Gold separator */}
        <View style={styles.separator}>
          <View style={styles.line} />
          <Text style={styles.diamond}>◆</Text>
          <View style={styles.line} />
        </View>
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        Elegance Rooted in Tradition
      </Animated.Text>

      {/* Loading dots */}
      <Animated.View style={[styles.dots, { opacity: fadeAnim }]}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, { opacity: 0.6 + i * 0.2 }]} />
        ))}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orb:          { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#FFD70015', top: height * 0.15, alignSelf: 'center' },
  logoContainer:{ alignItems: 'center' },
  crown:        { fontSize: 48, color: '#FFD700', marginBottom: 8 },
  tamilText:    { fontSize: 48, fontWeight: '800', color: '#FFD700', letterSpacing: 4, textShadowColor: '#FFD700', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  brandText:    { fontSize: 20, fontWeight: '300', color: '#FFFFFF', letterSpacing: 12, marginTop: 4 },
  separator:    { flexDirection: 'row', alignItems: 'center', marginVertical: 16, width: 200 },
  line:         { flex: 1, height: 1, backgroundColor: '#FFD70060' },
  diamond:      { color: '#FFD700', fontSize: 10, marginHorizontal: 10 },
  tagline:      { position: 'absolute', bottom: height * 0.2, color: '#AAAAAA', fontSize: 14, letterSpacing: 2, fontStyle: 'italic' },
  dots:         { position: 'absolute', bottom: height * 0.12, flexDirection: 'row', gap: 8 },
  dot:          { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD700' },
});
