import React from 'react';
import { TextInput, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from './ThemeContext';

interface SongSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const SongSearch: React.FC<SongSearchProps> = ({ searchQuery, onSearchChange }) => {
    const { theme } = useTheme();
    const styles = theme === 'light' ? lightStyles : darkStyles;

  return (
    <View>
      <TextInput
      style={styles.input}
      placeholder="Szukaj piosenek..."
      placeholderTextColor={theme === 'dark' ? '#dddddd' : '#333333'}
      value={searchQuery}
      onChangeText={onSearchChange}
    />
    {searchQuery.length > 0 && (
      <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearButton}>
        <Text style={styles.clearText}>×</Text>
      </TouchableOpacity>
    )}
    </View>
  );
};

const lightStyles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  input: {
    height: 40,
    paddingRight: 28,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    color: '#333333',
  },
  clearButton: {
    position: 'absolute',
    top: 3,
    right: 10,
    padding: 5,
  },
  clearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
  }
});
const darkStyles = StyleSheet.create({
  ...lightStyles,
    input: {
    ...lightStyles.input,
    borderColor: 'gray',
    backgroundColor: '#121212',
    color: '#dddddd',
    },
    clearText: {
      ...lightStyles.clearText,
      color: '#aaa',
    },
    clearButton:{
      ...lightStyles.clearButton,
    }
  });

export default SongSearch;
