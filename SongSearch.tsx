import React from 'react';
import { TextInput, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from './ThemeContext';

interface SongSearchProps<T = any> {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  items?: T[];
  getText?: (item: T) => string;
  category?: string | null;
  onResults?: (results: T[]) => void;
}

const SongSearch = <T,>({ searchQuery, onSearchChange, items, getText, category, onResults }: SongSearchProps<T>) => {
  const { theme } = useTheme();
  const styles = theme === 'light' ? lightStyles : darkStyles;

  const normalize = (input: string) =>
    input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .trim();

  React.useEffect(() => {
    if (!items || !onResults) return;
    const q = normalize(searchQuery);
    const tokens = q.split(/\s+/).filter(Boolean);

    const matches = (text: string) => {
      const n = normalize(text);
      return tokens.every(t => n.includes(t));
    };

    const filtered = items.filter((it: T) => {
      if (category && (it as any).category && (it as any).category !== category) return false;
      const text = getText ? getText(it) : String(it);
      if (!q) return true;
      return matches(text) || ((it as any).category && matches((it as any).category));
    });

    onResults(filtered);
  }, [items, searchQuery, category, getText, onResults]);

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
    fontSize: 20,
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
