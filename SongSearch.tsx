import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useTheme } from './ThemeContext';

interface SongSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const SongSearch: React.FC<SongSearchProps> = ({ searchQuery, onSearchChange }) => {
    const { theme } = useTheme();
    const styles = theme === 'light' ? lightStyles : darkStyles;

  return (
    <TextInput
      style={styles.input}
      placeholder="Szukaj piosenek..."
      placeholderTextColor={theme === 'dark' ? '#dddddd' : '#333333'}
      value={searchQuery}
      onChangeText={onSearchChange}
    />
  );
};

const lightStyles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    color: '#333333',
  },
});
const darkStyles = StyleSheet.create({
    input: {
    ...lightStyles.input,
    borderColor: 'gray',
    backgroundColor: '#121212',
    color: '#dddddd',
    },
  });

export default SongSearch;
