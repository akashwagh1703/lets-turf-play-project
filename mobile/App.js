import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TurfListScreen from './src/screens/TurfListScreen';
import BookingScreen from './src/screens/BookingScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TurfList">
        <Stack.Screen name="TurfList" component={TurfListScreen} options={{ title: 'Available Turfs' }} />
        <Stack.Screen name="TurfDetail" component={BookingScreen} options={{ title: 'Book Turf' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}