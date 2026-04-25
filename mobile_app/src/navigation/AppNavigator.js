import React, { useEffect, useState } from 'react';
import { NavigationContainer }           from '@react-navigation/native';
import { createNativeStackNavigator }    from '@react-navigation/native-stack';
import { createBottomTabNavigator }      from '@react-navigation/bottom-tabs';
import { useSelector }                   from 'react-redux';
import Icon                              from '@expo/vector-icons/Ionicons';
import AsyncStorage                      from '@react-native-async-storage/async-storage';

// ── Screens ──────────────────────────────────────────────────
import SplashScreen           from '../screens/SplashScreen';
import OnboardingScreen       from '../screens/OnboardingScreen';
import LoginScreen            from '../screens/LoginScreen';

// User screens
import HomeScreen             from '../screens/HomeScreen';
import ProductDetailsScreen   from '../screens/ProductDetailsScreen';
import CartScreen             from '../screens/CartScreen';
import CheckoutScreen         from '../screens/CheckoutScreen';
import ProfileScreen          from '../screens/ProfileScreen';
import WishlistScreen         from '../screens/WishlistScreen';
import OrderHistoryScreen     from '../screens/OrderHistoryScreen';
import ProductRequestScreen   from '../screens/ProductRequestScreen';
import SearchScreen           from '../screens/SearchScreen';
import CategoryScreen         from '../screens/CategoryScreen';
import OrderTrackingScreen    from '../screens/OrderTrackingScreen';
import LoyaltyScreen          from '../screens/LoyaltyScreen';
import ReviewScreen           from '../screens/ReviewScreen';
import PaymentScreen          from '../screens/PaymentScreen';
import PaymentSuccessScreen   from '../screens/PaymentSuccessScreen';

// Admin screens
import AdminDashboardScreen   from '../screens/AdminDashboardScreen';
import AdminProductsScreen    from '../screens/AdminProductsScreen';
import AdminOrdersScreen      from '../screens/AdminOrdersScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─────────────────────────────────────────────────────────────
//  Bottom Tab Navigator (User)
// ─────────────────────────────────────────────────────────────
function UserTabs() {
  const { isDark } = useSelector(s => s.theme);
  const tabBg   = isDark ? '#111111' : '#FFFFFF';
  const active  = '#FFD700';
  const inactive = isDark ? '#555555' : '#999999';
  const border  = isDark ? '#1E1E1E' : '#E5E5E5';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:         false,
        tabBarActiveTintColor:   active,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          backgroundColor: tabBg,
          borderTopColor:  border,
          borderTopWidth:  1,
          paddingBottom:   8,
          paddingTop:      4,
          height:          60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarIcon: ({ color, size }) => <Icon name="search" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ tabBarIcon: ({ color, size }) => <Icon name="cart" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ tabBarIcon: ({ color, size }) => <Icon name="heart" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <Icon name="person" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}

// ─────────────────────────────────────────────────────────────
//  Common Stack Options
// ─────────────────────────────────────────────────────────────
const darkHeader = {
  headerStyle:     { backgroundColor: '#0A0A0A' },
  headerTintColor: '#FFD700',
  headerTitleStyle:{ fontWeight: '700' },
  headerBackTitle: '',
};

// ─────────────────────────────────────────────────────────────
//  Root Navigator
// ─────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const [isReady,       setIsReady]       = useState(false);
  const [showOnboarding,setShowOnboarding]= useState(false);

  useEffect(() => {
    AsyncStorage.getItem('onboarded').then(val => {
      setShowOnboarding(!val);
      setIsReady(true);
    });
  }, []);

  if (!isReady) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>

        {/* ── NOT logged in ── */}
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Splash"      component={SplashScreen} />
            <Stack.Screen name="Onboarding"  component={OnboardingScreen} />
            <Stack.Screen name="Login"       component={LoginScreen} />
          </>
        ) : user?.role === 'admin' ? (
          /* ── Admin ── */
          <>
            <Stack.Screen name="Admin"         component={AdminDashboardScreen} />
            <Stack.Screen name="AdminProducts" component={AdminProductsScreen}
              options={{ headerShown: false }} />
            <Stack.Screen name="AdminOrders"   component={AdminOrdersScreen}
              options={{ headerShown: false }} />
          </>
        ) : (
          /* ── User ── */
          <>
            <Stack.Screen name="Main"           component={UserTabs} />
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen}
              options={{ ...darkHeader, headerShown: true, title: 'Product Details' }} />
            <Stack.Screen name="Checkout"       component={CheckoutScreen}
              options={{ ...darkHeader, headerShown: true, title: 'Checkout' }} />
            <Stack.Screen name="Payment"        component={PaymentScreen}
              options={{ ...darkHeader, headerShown: true, title: 'Payment' }} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
            <Stack.Screen name="OrderTracking"  component={OrderTrackingScreen}
              options={{ ...darkHeader, headerShown: true, title: 'Track Order' }} />
            <Stack.Screen name="OrderHistory"   component={OrderHistoryScreen}
              options={{ ...darkHeader, headerShown: true, title: 'My Orders' }} />
            <Stack.Screen name="Loyalty"        component={LoyaltyScreen}
              options={{ headerShown: false }} />
            <Stack.Screen name="Reviews"        component={ReviewScreen}
              options={{ ...darkHeader, headerShown: true, title: 'Reviews' }} />
            <Stack.Screen name="ProductRequest" component={ProductRequestScreen}
              options={{ ...darkHeader, headerShown: true, title: 'Request Product' }} />
            <Stack.Screen name="Categories"     component={CategoryScreen}
              options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
