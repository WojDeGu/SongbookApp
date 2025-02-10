import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from './ThemeContext'; // Pobranie motywu z kontekstu

interface CategoryPickerProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({ selectedCategory, onSelectCategory }) => {
  const { theme } = useTheme(); // Pobieramy aktualny motyw
  const styles = theme === 'light' ? lightStyles : darkStyles;

  const categories = ['Uwielbienie', 'Wielkanoc', 'Wielki Post', 'Adwent', 'Zwykłe', 'Msza'];

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.item,
              category === selectedCategory && styles.selectedItem,
            ]}
            onPress={() => {
              onSelectCategory(category === selectedCategory ? null : category);
            }}
          >
            <Text
              style={[
                styles.itemText,
                category === selectedCategory && styles.selectedItemText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const lightStyles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  selectedItem: {
    borderWidth: 2,
    backgroundColor: '#007BFF',
    borderColor: '#0056b3',
  },
  itemText: {
    fontSize: 16,
    color: '#333333',
  },
  selectedItemText: {
    fontWeight: 'bold',
    color: '#ffffff', // Zmieniony na biały dla jasnego motywu
  },
});

const darkStyles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#555',
    backgroundColor: '#222222',
    borderRadius: 20,
  },
  selectedItem: {
    borderWidth: 2,
    backgroundColor: '#ffcc00',
    borderColor: '#ffaa00',
  },
  itemText: {
    fontSize: 16,
    color: '#dddddd',
  },
  selectedItemText: {
    fontWeight: 'bold',
    color: '#000000', // Zmieniony na czarny dla ciemnego motywu
  },
});

export default CategoryPicker;