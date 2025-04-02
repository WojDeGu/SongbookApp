import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTheme } from './ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        Tryb: {theme === 'light' ? 'Jasny' : 'Ciemny'}
      </Text>
      <Button title="Zmień Tryb" onPress={toggleTheme} />
    </View>
  );
};

export default ThemeToggle;