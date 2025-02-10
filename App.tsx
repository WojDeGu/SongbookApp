import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen'; // Twój główny ekran
import SongDetail from './SongDetail'; // Szczegóły piosenki
import { ThemeProvider, useTheme } from './ThemeContext'; // Importujemy ThemeProvider i useTheme

export type RootStackParamList = {
  HomeScreen: undefined;
  SongDetail: { songId: number };
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
};

const AppNavigator: React.FC = () => {
  const { theme } = useTheme(); // Pobranie bieżącego motywu

  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme === 'light' ? '#ffffff' : '#000000', // Białe tło w trybie jasnym, czarne w ciemnym
        },
        headerTintColor: theme === 'light' ? '#000000' : '#ffffff', // Czarny tekst w trybie jasnym, biały w ciemnym
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="SongDetail" component={SongDetail} />
    </Stack.Navigator>
  );
};

export default App;