import React, { useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, DeviceEventEmitter, Linking, Switch, Platform, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeContext';
import ChangelogModal, { useChangelogModal } from './Changelog';
import env from "./env.js";
import { MobileAds, AdsConsent, AdsConsentStatus  } from 'react-native-google-mobile-ads';

const API_URL = env.API_URL;
const USER_AGENT = env.USER_AGENT;
const LOCAL_STORAGE_KEY = 'songbook.json';

const SettingsScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { theme, toggleTheme } = useTheme();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [songCount, setSongCount] = useState<number | null>(null);
  const [showFontSizeAdjuster, setShowFontSizeAdjuster] = useState<boolean>(false);
  const [showAutoScroll, setShowAutoScroll] = useState<boolean>(false);
  const { isVisible, showModal, hideModal } = useChangelogModal();
  

  useEffect(() => {
      checkLocalData();
      const loadSettings = async () => {
        const storedValue = await AsyncStorage.getItem('showFontSizeAdjuster');
        const storedValueScroll = await AsyncStorage.getItem('showAutoScroll')
        if (storedValue !== null) {
          setShowFontSizeAdjuster(JSON.parse(storedValue));
        }
        if (storedValueScroll !== null) {
          setShowAutoScroll(JSON.parse(storedValueScroll));
        }
      };
      loadSettings();
    }, []);

    // Komponent do pokazywania/ukrywania przycisków zmiany czcionki
  const toggleFontSizeAdjuster = async () => {
    const newValue = !showFontSizeAdjuster;
    setShowFontSizeAdjuster(newValue);
    await AsyncStorage.setItem('showFontSizeAdjuster', JSON.stringify(newValue));

    DeviceEventEmitter.emit('updateFontSizeAdjuster', newValue);
  };
  const toggleAutoScroll = async () => {
    const newValue = !showAutoScroll;
    setShowAutoScroll(newValue);
    await AsyncStorage.setItem('showAutoScroll', JSON.stringify(newValue));

    DeviceEventEmitter.emit('updateAutoScroll', newValue);
  };

  // Komponent do sprawdzania bazy piosenek
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

  // Komponent do pobierania bazy piosenek
  const fetchSongsFromAPI = async () => {
    if (isFetching) return;
    setIsFetching(true);

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
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

  // Komponent do określenia prywatności w AdMob
  const showPrivacyMessaging = async () => {
    try {
      await MobileAds().initialize();
  
      const consentInfo = await AdsConsent.requestInfoUpdate();
  
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
  
  // Komponent przenoszący na stronę z polityką prywatności
  const openPrivacyPolicy = () => {
    Linking.openURL('http://politykaprywatnosci.slowkodaje.pl').catch(err => 
      console.error("Nie można otworzyć linku:", err)
    );
  };

  const styles = theme === 'light' ? lightStyles(isTablet) : darkStyles(isTablet);

  return (
    <View style={styles.container}>
      {songCount !== null && <Text style={styles.songCount}>Liczba piosenek: {songCount}</Text>}
      <TouchableOpacity style={styles.buttonPink} onPress={fetchSongsFromAPI} disabled={isFetching}>
        <Text style={styles.buttonText}>{isFetching ? 'Pobieranie...' : 'Zaktualizuj listę piosenek'}</Text>
      </TouchableOpacity>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Tryb: {theme === 'light' ? 'Jasny' : 'Ciemny'}</Text>
        <Switch value={theme === 'dark'} onValueChange={toggleTheme} trackColor={{ false: '#E5E5EA', true: '#34C759' }}
        thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
        ios_backgroundColor="#E5E5EA"
        style={Platform.OS === 'android'? { transform: isTablet? [{ scaleX: 1.6 }, { scaleY: 1.6 }]:[{ scaleX: 1.2 }, { scaleY: 1.2 }] } : { transform: [{ scaleX: 1 }, { scaleY: 1 }] }}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Pokaż regulator czcionki</Text>
        <Switch value={showFontSizeAdjuster} onValueChange={toggleFontSizeAdjuster} trackColor={{ false: '#E5E5EA', true: '#34C759' }}
          thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
          ios_backgroundColor="#E5E5EA"
          style={Platform.OS === 'android'? { transform: isTablet? [{ scaleX: 1.6 }, { scaleY: 1.6 }]:[{ scaleX: 1.2 }, { scaleY: 1.2 }], marginRight: isTablet? 15:5 } : { transform: [{ scaleX: 1 }, { scaleY: 1 }] }}
        />
      </View>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Pokaż AutoScroll</Text>
        <Switch value={showAutoScroll} onValueChange={toggleAutoScroll} trackColor={{ false: '#E5E5EA', true: '#34C759' }}
          thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
          ios_backgroundColor="#E5E5EA"
          style={Platform.OS === 'android'? { transform: isTablet? [{ scaleX: 1.6 }, { scaleY: 1.6 }]:[{ scaleX: 1.2 }, { scaleY: 1.2 }], marginRight: isTablet? 15:5 } : { transform: [{ scaleX: 1 }, { scaleY: 1 }] }}
        />
      </View>

      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity style={styles.buttonBlue} onPress={showModal}>
          <Text style={styles.buttonText}>Pokaż najnowsze zmiany</Text>
        </TouchableOpacity>
        <ChangelogModal isVisible={isVisible} onClose={hideModal} />
        <TouchableOpacity style={styles.buttonBlue} onPress={openPrivacyPolicy}>
        <Text style={styles.buttonText}>Polityka Prywatności</Text>
        </TouchableOpacity>
        {Platform.OS === 'android' && (
          <TouchableOpacity style={styles.buttonBlue} onPress={showPrivacyMessaging}>
            <Text style={styles.buttonText}>Ustawienia prywatności</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const lightStyles = (isTablet: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  songCount: {
    marginTop: 20,
    fontSize: isTablet ? 36:24,
    textAlign: 'center',
    marginBottom: 10,
    color: '#000000',
  },
  title: {
    fontSize: isTablet ? 28:24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: isTablet? 24:18,
    marginRight: 10,
  },
  buttonBlue:{
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
  buttonPink:{
    backgroundColor: '#DE6FA1',
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
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: isTablet? 20:16,
    fontWeight: 'bold',
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

const darkStyles = (isTablet: boolean) => StyleSheet.create({
  ...lightStyles(isTablet),
  container: {
    ...lightStyles(isTablet).container,
    backgroundColor: '#121212',
  },
  title: {
    ...lightStyles(isTablet).title,
    color: '#ffffff',
  },
  switchLabel: {
    ...lightStyles(isTablet).switchLabel,
    color: '#ffffff',
  },
  buttonBlue:{
    ...lightStyles(isTablet).buttonBlue,
    backgroundColor: '#1E40AF',
  },
  buttonPink:{
    ...lightStyles(isTablet).buttonPink,
    backgroundColor: '#DE5285',
  },
  songCount:{
    ...lightStyles(isTablet).songCount,
    color: 'white',
  },
  bottomButtonsContainer:{
    ...lightStyles(isTablet).bottomButtonsContainer,
  }
});

export default SettingsScreen;
