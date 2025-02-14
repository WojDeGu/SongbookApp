import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeContext';


const API_URL = 'https://songbook.slowkodaje.pl/api.php';
const LOCAL_STORAGE_KEY = 'songbook.json';

const SettingsScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [songCount, setSongCount] = useState<number | null>(null);
  const [showFontSizeAdjuster, setShowFontSizeAdjuster] = useState<boolean>(false);

  useEffect(() => {
      checkLocalData();
      const loadSettings = async () => {
        const storedValue = await AsyncStorage.getItem('showFontSizeAdjuster');
        if (storedValue !== null) {
          setShowFontSizeAdjuster(JSON.parse(storedValue));
        }
      };
      loadSettings();
    }, []);

    const toggleFontSizeAdjuster = async () => {
        const newValue = !showFontSizeAdjuster;
        setShowFontSizeAdjuster(newValue);
        await AsyncStorage.setItem('showFontSizeAdjuster', JSON.stringify(newValue));

        DeviceEventEmitter.emit('updateFontSizeAdjuster', newValue); // Wysyłamy event
      };

  const checkLocalData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const songs = JSON.parse(storedData);
        setSongCount(songs.length);
      } else {
        setSongCount(0);
      }
    } catch (error) {
      console.error('Błąd przy sprawdzaniu lokalnych danych:', error);
    }
  };

  const fetchSongsFromAPI = async () => {
    if (isFetching) return;
    setIsFetching(true);

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'User-Agent': 'SongbookApp',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Niepoprawna odpowiedź serwera');
      }

      const data = await response.json();
      await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

      Alert.alert('Sukces', 'Lista piosenek została pobrana i zapisana.');
      setSongCount(data.length);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się pobrać piosenek.');
      console.error('Błąd pobierania piosenek:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const styles = theme === 'light' ? lightStyles : darkStyles;

  return (
    <View style={styles.container}>
        
      {songCount !== null && <Text style={styles.songCount}>Liczba piosenek: {songCount}</Text>}
      <TouchableOpacity style={styles.button} onPress={fetchSongsFromAPI} disabled={isFetching}>
        <Text style={styles.buttonText}>{isFetching ? 'Pobieranie...' : 'Zaktualizuj listę piosenek'}</Text>
      </TouchableOpacity>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Tryb: {theme === 'light' ? 'Jasny' : 'Ciemny'}</Text>
        <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
      </View>

        <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Pokaż regulator czcionki</Text>
            <Switch value={showFontSizeAdjuster} onValueChange={toggleFontSizeAdjuster} />
        </View>
    </View>
  );
};

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 18,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  songCount: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#000000',
  },
});

const darkStyles = StyleSheet.create({
  ...lightStyles,
  container: {
    ...lightStyles.container,
    backgroundColor: '#121212',
  },
  title: {
    ...lightStyles.title,
    color: '#ffffff',
  },
  switchLabel: {
    ...lightStyles.switchLabel,
    color: '#ffffff',
  },
  button: {
    ...lightStyles.button,
    backgroundColor: '#1E40AF',
  },
  songCount:{
    ...lightStyles.songCount,
    color: 'white',
  }
});

export default SettingsScreen;
