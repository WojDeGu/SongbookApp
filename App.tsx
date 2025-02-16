import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './HomeScreen';
import SongDetail from './SongDetail';
import SettingsScreen from './SettingsScreen';
import { ThemeProvider, useTheme } from './ThemeContext';
import { TouchableOpacity } from 'react-native';
import { Svg, Path } from 'react-native-svg';


export type RootStackParamList = {
  HomeScreen: undefined;
  SettingsScreen: undefined;
  SongDetail: { songId: number };
};

const Stack = createStackNavigator<RootStackParamList>();

const SettingsIcon = ({ color = "#000", secondcolor = "#000", size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
    <Path 
      fill={color}
      d="M454.2 189.1l-33.6-5.7c-3.5-11.3-8-22.2-13.5-32.6l19.8-27.7c8.4-11.8 7.1-27.9-3.2-38.1l-29.8-29.8c-5.6-5.6-13-8.7-20.9-8.7-6.2 0-12.1 1.9-17.1 5.5l-27.8 19.8c-10.8-5.7-22.1-10.4-33.8-13.9l-5.6-33.2c-2.4-14.3-14.7-24.7-29.2-24.7h-42.1c-14.5 0-26.8 10.4-29.2 24.7l-5.8 34c-11.2 3.5-22.1 8.1-32.5 13.7l-27.5-19.8c-5-3.6-11-5.5-17.2-5.5-7.9 0-15.4 3.1-20.9 8.7l-29.9 29.8c-10.2 10.2-11.6 26.3-3.2 38.1l20 28.1c-5.5 10.5-9.9 21.4-13.3 32.7l-33.2 5.6c-14.3 2.4-24.7 14.7-24.7 29.2v42.1c0 14.5 10.4 26.8 24.7 29.2l34 5.8c3.5 11.2 8.1 22.1 13.7 32.5l-19.7 27.4c-8.4 11.8-7.1 27.9 3.2 38.1l29.8 29.8c5.6 5.6 13 8.7 20.9 8.7 6.2 0 12.1-1.9 17.1-5.5l28.1-20c10.1 5.3 20.7 9.6 31.6 13l5.6 33.6c2.4 14.3 14.7 24.7 29.2 24.7h42.2c14.5 0 26.8-10.4 29.2-24.7l5.7-33.6c11.3-3.5 22.2-8 32.6-13.5l27.7 19.8c5 3.6 11 5.5 17.2 5.5l0 0c7.9 0 15.3-3.1 20.9-8.7l29.8-29.8c10.2-10.2 11.6-26.3 3.2-38.1l-19.8-27.8c5.5-10.5 10.1-21.4 13.5-32.6l33.6-5.6c14.3-2.4 24.7-14.7 24.7-29.2v-42.1c0-14.5-10.4-26.8-24.7-29.2zM239.4 136c-57 0-103.3 46.3-103.3 103.3s46.3 103.3 103.3 103.3 103.3-46.3 103.3-103.3-46.3-103.3-103.3-103.3zm0 179.6c-42.1 0-76.3-34.2-76.3-76.3s34.2-76.3 76.3-76.3 76.3 34.2 76.3 76.3-34.2 76.3-76.3 76.3z"
    />
    <Path 
      fill={secondcolor}
      d="M239.4,136.001c-57,0-103.3,46.3-103.3,103.3s46.3,103.3,103.3,103.3s103.3-46.3,103.3-103.3S296.4,136.001,239.4,136.001
			z M239.4,315.601c-42.1,0-76.3-34.2-76.3-76.3s34.2-76.3,76.3-76.3s76.3,34.2,76.3,76.3S281.5,315.601,239.4,315.601z"
    />
  </Svg>
);

const AppNavigator: React.FC = () => {
  const { theme } = useTheme();
  const iconColor = theme === 'light' ? '#121212' : '#ffffff';

  return (
    <Stack.Navigator
  screenOptions={({ navigation, route }) => ({
    headerStyle: {
      backgroundColor: theme === 'light' ? '#ffffff' : '#121212',
    },
    headerTintColor: iconColor,
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    headerTitleAlign: 'center',
    headerRight: () =>
      route.name !== 'SettingsScreen' ? ( // Ukrywa headerRight na SettingsScreen
        <TouchableOpacity style={{ marginRight: 15 }}onPress={() => navigation.navigate('SettingsScreen')}>
          <SettingsIcon size={28} color={theme === 'light' ? '#304052' : 'white'} secondcolor={theme === 'dark' ? '#304052' : 'white'}/>
        </TouchableOpacity>
      ) : null,
  })}
>

      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Strona główna' }} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: 'Ustawienia' }} />
      <Stack.Screen name="SongDetail" component={SongDetail} options={{ title: 'Piosenka' }} />
    </Stack.Navigator>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;