import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, DeviceEventEmitter, Linking, Switch, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeContext';
import { MobileAds, AdsConsent, AdsConsentDebugGeography, AdsConsentStatus  } from 'react-native-google-mobile-ads';

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

  const showPrivacyMessaging = async () => {
    try {
      await MobileAds().initialize();
  
      // Pobierz aktualny status zgody
      const consentInfo = await AdsConsent.requestInfoUpdate();
  
      // Jeśli zgoda została już wyrażona, nadal pozwól użytkownikowi otworzyć formularz
      if (consentInfo.status === AdsConsentStatus.REQUIRED || consentInfo.status === AdsConsentStatus.OBTAINED) {
        await AdsConsent.showForm();
      } else {
        Alert.alert("Brak potrzeby", "Twoja zgoda została już określona i nie wymaga aktualizacji.");
      }
    } catch (error) {
      console.error("Błąd Privacy Messaging:", error);
      Alert.alert("Błąd", "Nie udało się otworzyć formularza zgody.");
    }
  };
  
    

  const openPrivacyPolicy = () => {
    Linking.openURL('http://politykaprywatnosci.slowkodaje.pl').catch(err => 
      console.error("Nie można otworzyć linku:", err)
    );
  };

  const styles = theme === 'light' ? lightStyles : darkStyles;

  return (
    <View style={styles.container}>
        
      {songCount !== null && <Text style={styles.songCount}>Liczba piosenek: {songCount}</Text>}
      <TouchableOpacity style={styles.buttonPrivacy} onPress={fetchSongsFromAPI} disabled={isFetching}>
        <Text style={styles.buttonText}>{isFetching ? 'Pobieranie...' : 'Zaktualizuj listę piosenek'}</Text>
      </TouchableOpacity>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Tryb: {theme === 'light' ? 'Jasny' : 'Ciemny'}</Text>
        <Switch value={theme === 'dark'} onValueChange={toggleTheme} trackColor={{ false: '#E5E5EA', true: '#34C759' }} // iOS colors
        thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined} // iOS thumb
        ios_backgroundColor="#E5E5EA" // iOS background
        style={Platform.OS === 'android'? { transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] } : { transform: [{ scaleX: 1 }, { scaleY: 1 }] }} // Skalowanie dla Androida
        />
      </View>

        <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Pokaż regulator czcionki</Text>
            <Switch value={showFontSizeAdjuster} onValueChange={toggleFontSizeAdjuster} trackColor={{ false: '#E5E5EA', true: '#34C759' }} // iOS colors
            thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined} // iOS thumb
            ios_backgroundColor="#E5E5EA" // iOS background
            style={Platform.OS === 'android'? { transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] } : { transform: [{ scaleX: 1 }, { scaleY: 1 }] }} // Skalowanie dla Androida
            />
        </View>

        <View style={styles.bottomButtonsContainer}>
            <TouchableOpacity style={styles.buttonPrivacy} onPress={openPrivacyPolicy}>
            <Text style={styles.buttonText}>Polityka Prywatności</Text>
            </TouchableOpacity>
            {Platform.OS === 'android' && (
            <TouchableOpacity style={styles.buttonPrivacy} onPress={showPrivacyMessaging}>
            <Text style={styles.buttonText}>Ustawienia prywatności</Text>
            </TouchableOpacity>)}
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
  buttonPrivacy:{
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  songCount: {
    marginTop: 10,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
    color: '#000000',
  },
  bottomButtonsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    width: '100%',
    padding: 15,
    position: 'absolute',
    bottom: 10,
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
  buttonPrivacy:{
    ...lightStyles.buttonPrivacy,
    backgroundColor: '#1E40AF',
  },
  button: {
    ...lightStyles.button,
    backgroundColor: '#1E40AF',
  },
  songCount:{
    ...lightStyles.songCount,
    color: 'white',
  },
  bottomButtonsContainer:{
    ...lightStyles.bottomButtonsContainer,
  }
});

export default SettingsScreen;
