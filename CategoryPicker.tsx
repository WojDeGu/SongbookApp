import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from './ThemeContext';

interface CategoryPickerProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({ selectedCategory, onSelectCategory }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { theme } = useTheme();
  const styles = theme === 'light' ? lightStyles(isTablet) : darkStyles(isTablet);

  const categories = ['Inne', 'Msza', 'Uwielbienie', 'Maryjne', 'Do Ducha Świętego', 'Wielkanoc', 'Wielki Post', 'Adwent'];

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

const lightStyles = (isTablet: boolean) => StyleSheet.create({
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
    backgroundColor: '#007BFF',
    borderColor: '#0056b3',
  },
  itemText: {
    fontSize: isTablet? 20:16,
    color: '#333333',
  },
  selectedItemText: {
    fontWeight: '700',
    color: '#ffffff',
  },
});

const darkStyles = (isTablet: boolean) => StyleSheet.create({
  ...lightStyles(isTablet),
  label: {
    ...lightStyles(isTablet).label,
    color: '#ffffff',
  },
  item: {
    ...lightStyles(isTablet).item,
    borderColor: '#555',
    backgroundColor: '#222222'
  },
  selectedItem: {
    ...lightStyles(isTablet).selectedItem,
    backgroundColor: '#1E40AF',
    borderColor: '#0056b3',
  },
  itemText: {
    ...lightStyles(isTablet).itemText,
    color: '#dddddd',
  },
  selectedItemText: {
    ...lightStyles(isTablet).selectedItemText,
    color: '#ffffff',
  },
});

export default CategoryPicker;