import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, useWindowDimensions, ImageBackground } from 'react-native';
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

  const categories = ['Inne', 'Msza', 'Uwielbienie', 'Maryjne', 'Do Ducha Świętego', 'Salezjańskie', 'Wielkanoc', 'Wielki Post', 'Adwent'];

  const categoryStyles: Record<
    string,
    {
      backgroundColor?: string;
      textColor?: string;
      borderColor?: string;
      selectedBackgroundColor?: string;
      selectedTextColor?: string;
      selectedBorderColor?: string;
      backgroundImage?: any;
    }
  > = {
    Salezjańskie: {
      selectedBackgroundColor: '#5d2002d6',
      selectedTextColor: '#ffffff',
      selectedBorderColor: '#5d2002d6',
      backgroundImage: require('./assets/SDB.jpeg'),
    },
    
  }; // nazwy kilku wyrazowe pisać w cudzysłowie np. "Wielki Post"

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => {
          const customStyle = categoryStyles[category] || {};
          const isSelected = category === selectedCategory;

          const backgroundColor = isSelected
            ? customStyle.selectedBackgroundColor || styles.selectedItem.backgroundColor
            : customStyle.backgroundColor || styles.item.backgroundColor;

          const textColor = isSelected
            ? customStyle.selectedTextColor || styles.selectedItemText.color
            : customStyle.textColor || styles.itemText.color;
          
           const borderColor = isSelected
            ? customStyle.selectedBorderColor || styles.selectedItem.borderColor
            : customStyle.borderColor || styles.item.borderColor;

          const buttonStyle = [
            styles.item,
            isSelected && styles.selectedItem,
            backgroundColor && { backgroundColor },
            borderColor && { borderColor },
          ];

          const textStyle = [
            styles.itemText,
            isSelected && styles.selectedItemText,
            textColor && { color: textColor },
          ];

          const content = (
            <Text style={textStyle}>
              {category}
            </Text>
          );

          return (
            <TouchableOpacity
              key={category}
              onPress={() => onSelectCategory(isSelected ? null : category)}
              style={{ marginHorizontal: 5 }}
            >
              {isSelected && customStyle.backgroundImage ? (
                <ImageBackground
                  source={customStyle.backgroundImage}
                  style={[...buttonStyle, { justifyContent: 'center', alignItems: 'center' }]}
                  imageStyle={{ borderRadius: 20, resizeMode: 'cover', opacity: 0.3 }}
                >
                  {content}
                </ImageBackground>
              ) : (
                <View style={buttonStyle}>
                  {content}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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