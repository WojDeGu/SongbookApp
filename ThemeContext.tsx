// ThemeContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

// Typ dla naszego kontekstu
type ThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

// Tworzymy kontekst dla tematu
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Domyślnie ustawiamy tryb na jasny

  useEffect(() => {
    // Odczytujemy zapisany motyw z AsyncStorage
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('theme');
        if (storedTheme) {
          setTheme(storedTheme as 'light' | 'dark');
        }
      } catch (error) {
        console.error('Błąd podczas ładowania motywu: ', error);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    try {
      // Zapisujemy wybrany motyw w AsyncStorage
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Błąd podczas zapisywania motywu: ', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook do korzystania z kontekstu
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};