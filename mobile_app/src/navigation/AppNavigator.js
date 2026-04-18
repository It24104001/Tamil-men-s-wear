import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import Icon from '@expo/vector-icons/Ionicons';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import WishlistScreen from '../screens/WishlistScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#FFD700', tabBarInactiveTintColor: '#888', tabBarStyle: { backgroundColor: '#000', borderTopColor: '#332b00' } }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({color}) => <Icon name="home" size={24} color={color} /> }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarIcon: ({color}) => <Icon name="cart" size={24} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({color}) => <Icon name="person" size={24} color={color} /> }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : user?.role === 'admin' ? (
          <Stack.Screen name="Admin" component={AdminDashboardScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ headerShown: true, title: 'Details', headerStyle: { backgroundColor: '#000' }, headerTintColor: '#FFD700' }}/>
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true, title: 'Checkout', headerStyle: { backgroundColor: '#000' }, headerTintColor: '#FFD700' }}/>
            <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ headerShown: true, title: 'Wishlist', headerStyle: { backgroundColor: '#000' }, headerTintColor: '#FFD700' }}/>
            <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ headerShown: true, title: 'Order History', headerStyle: { backgroundColor: '#000' }, headerTintColor: '#FFD700' }}/>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
