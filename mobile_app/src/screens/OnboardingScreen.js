import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  FlatList, Animated, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji:    '👔',
    title:    'Premium Tamil Fashion',
    titleTa:  'உயர்தர தமிழ் உடை',
    subtitle: 'Discover curated men\'s wear crafted with tradition and elegance.',
    gradient: ['#0A0A0A', '#1a1200'],
  },
  {
    id: '2',
    emoji:    '🛍️',
    title:    'Shop with Ease',
    titleTa:  'எளிதாக கோரிக்கை',
    subtitle: 'Browse thousands of styles, filter by size and category, and checkout in seconds.',
    gradient: ['#0A0A0A', '#001a0a'],
  },
  {
    id: '3',
    emoji:    '⭐',
    title:    'Earn Loyalty Rewards',
    titleTa:  'விசுவாச பரிசுகள்',
    subtitle: 'Every purchase earns you points. Redeem them for exclusive discounts.',
    gradient: ['#0A0A0A', '#1a0a00'],
  },
  {
    id: '4',
    emoji:    '🚀',
    title:    'Fast Delivery',
    titleTa:  'வேகமான டெலிவரி',
    subtitle: 'Track your orders in real-time and enjoy express delivery across Tamil Nadu.',
    gradient: ['#0A0A0A', '#0a001a'],
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const fadeAnim    = useRef(new Animated.Value(1)).current;

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('onboarded', 'true');
    navigation.replace('Login');
  };

  const renderSlide = ({ item }) => (
    <LinearGradient colors={item.gradient} style={styles.slide}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        <View style={styles.emojiGlow} />
      </View>
      <Text style={styles.titleTa}>{item.titleTa}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleGetStarted}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={i => i.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomContainer}>
        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
          <LinearGradient colors={['#FFD700', '#B8960C']} style={styles.nextBtnGrad}>
            <Text style={styles.nextBtnText}>
              {currentIndex === SLIDES.length - 1 ? 'Get Started →' : 'Next →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#0A0A0A' },
  slide:          { width, height, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  skipBtn:        { position: 'absolute', top: 50, right: 24, zIndex: 10 },
  skipText:       { color: '#AAAAAA', fontSize: 14 },
  emojiContainer: { alignItems: 'center', marginBottom: 32, position: 'relative' },
  emoji:          { fontSize: 80 },
  emojiGlow:      { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFD70015', top: -10 },
  titleTa:        { fontSize: 22, fontWeight: '800', color: '#FFD700', textAlign: 'center', marginBottom: 4 },
  title:          { fontSize: 26, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 16 },
  subtitle:       { fontSize: 15, color: '#AAAAAA', textAlign: 'center', lineHeight: 24 },
  bottomContainer:{ position: 'absolute', bottom: 40, width: '100%', alignItems: 'center', gap: 20 },
  dotsRow:        { flexDirection: 'row', gap: 8 },
  dot:            { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' },
  dotActive:      { width: 24, height: 8, borderRadius: 4, backgroundColor: '#FFD700' },
  nextBtn:        { width: width - 80, borderRadius: 16 },
  nextBtnGrad:    { padding: 18, borderRadius: 16, alignItems: 'center' },
  nextBtnText:    { color: '#000', fontSize: 16, fontWeight: '700' },
});
