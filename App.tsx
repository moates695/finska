import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Image } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import Home from './src/Home';
import Game from './src/Game';
import Settings from './src/Settings';
import AddPlayer from './src/AddPlayer';
import Setup from './src/Setup';

import { store } from './src/store';

import home from './assets/home.png';
import add from './assets/add.png';
import settings from './assets/settings.png';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home} options={{headerShown: false}}/>
          <Stack.Screen name="Game" component={Game} options={{headerShown: false}}/>
          <Stack.Screen name="Setup" component={Setup} options={{headerShown: false}}/>
          <Stack.Screen name="AddPlayer" component={AddPlayer} options={{headerShown: false}}/>
          <Stack.Screen name="Settings" component={Settings} options={{headerShown: false}}/>
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
