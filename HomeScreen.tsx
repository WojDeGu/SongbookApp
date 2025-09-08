import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, Platform, useWindowDimensions } from 'react-native';
import CategoryPicker from './CategoryPicker';
import SongList from './SongList';
import { useTheme } from './ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SongSearch from './SongSearch';
import AdBanner from './AdBanner';
import { Svg, Path } from 'react-native-svg';
import env from "./env.js";
import {AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';
import { requestTrackingPermission } from 'react-native-tracking-transparency';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const API_URL = env.API_URL;
const LOCAL_STORAGE_KEY = 'songbook.json';

const HomeScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const { theme } = useTheme();
  const [favoriteSongIds, setFavoriteSongIds] = useState<number[]>([]);
  const [songCount, setSongCount] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [songs, setSongs] = useState<any[]>([]);
  const { width } = useWindowDimensions();
  const nav = useNavigation<any>();
  const isTablet = width >= 768;
  const [presetsSwitch, setPresetsSwitch] = useState(false);

  const requestATT = async () => {
    if (Platform.OS === 'ios') {
      const status = await requestTrackingPermission();
      console.log('ATT Status:', status);
      
      if (status === 'not-determined') {
        Alert.alert('Prośba o zgodę', 'Aplikacja prosi o zgodę na śledzenie.');
      }
    }
  };

  useEffect(() => {
    loadFavoritesOnly();
    loadFavoriteSongs();
    checkLocalData();
    requestATT();
    
    if (Platform.OS === 'android') {
      checkPrivacyConsent();
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setPresetsSwitch(false);
      return () => {};
    }, [])
  );
  // funkcja sprawdzania, czy formularz prywatności został wcześniej wykonany
  const checkPrivacyConsent = async () => {
    try {
      const hasSeenConsent = await AsyncStorage.getItem('hasSeenConsent');
  
      if (!hasSeenConsent) {
        const consentInfo = await AdsConsent.requestInfoUpdate();
        if (consentInfo.status === AdsConsentStatus.REQUIRED) {
          await AdsConsent.showForm();
        }
        await AsyncStorage.setItem('hasSeenConsent', 'true');
      }
    } catch (error) {
      console.error('Błąd sprawdzania zgody:', error);
    }
  };

  const checkLocalData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const songs = JSON.parse(storedData);
        setSongs(songs);
        setSongCount(songs.length);
      } else {
        setSongCount(0);
      }
    } catch (error) {
      console.error('Błąd przy sprawdzaniu lokalnych danych:', error);
    }
  };

  const fetchSongsFromAPI = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'User-Agent': env.USER_AGENT,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Niepoprawna odpowiedź serwera');
      }
  
      const data = await response.json();
      await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  
      setSongs([...data]);
      setSongCount(data.length);
      refreshSongs();
  
      Alert.alert('Sukces', 'Piosenki zostały pobrane.');
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się pobrać piosenek.');
      console.error('Błąd pobierania piosenek:', error);
    }
  };
  
  const refreshSongs = async () => {
    try {
      const storedSongs = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedSongs) {
        setSongs(JSON.parse(storedSongs));
      }
    } catch (error) {
      console.error('Błąd odświeżania piosenek:', error);
    }
  };

  const updateFavorites = (favoriteIds: number[]) => {
    setFavoriteSongIds(favoriteIds);
    AsyncStorage.setItem('favoriteSongs', JSON.stringify(favoriteIds));
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };  

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  const toggleFavoriteSwitch = async () => {
    const newFavoritesOnly = !favoritesOnly;
    setFavoritesOnly(newFavoritesOnly);
  };

  const loadFavoritesOnly = async () => {
    try {
      const storedFavoritesOnly = await AsyncStorage.getItem('favoritesOnly');
      if (storedFavoritesOnly !== null) {
        setFavoritesOnly(JSON.parse(storedFavoritesOnly));
      }
    } catch (error) {
      console.error('Błąd przy ładowaniu "favoritesOnly" z AsyncStorage:', error);
    }
  };

  const loadFavoriteSongs = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favoriteSongs');
      if (storedFavorites !== null) {
        setFavoriteSongIds(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Błąd przy ładowaniu ulubionych piosenek:', error);
    }
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  }

  const styles = theme === 'light' ? lightStyles(isTablet) : darkStyles(isTablet);
  
  return (
    <View style={styles.container}>
      <AdBanner />
      <Text style={styles.title}>Wybierz kategorię</Text>
      <CategoryPicker selectedCategory={selectedCategory} onSelectCategory={handleCategoryChange} />
      <View style={styles.switches}>
        {isTablet ? (
          <>
            <View style={styles.switchesLeft}>
              <View style={[styles.switchContainer, { marginRight: 24 }]}>
                <Text style={styles.switchLabel}>Ulubione</Text>
                <Switch value={favoritesOnly} onValueChange={toggleFavoriteSwitch} trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                        thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                        ios_backgroundColor="#E5E5EA"
                        style={Platform.OS === 'android'? { transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] } : { transform: [{ scaleX: 1 }, { scaleY: 1 }] }}
                        />
              </View>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Presety</Text>
                <Switch
                  value={presetsSwitch}
                  onValueChange={(v) => {
                    setPresetsSwitch(v);
                    if (v) nav.navigate('PresetList');
                  }}
                  trackColor={{ false: '#E5E5EA', true: '#1E40AF' }}
                  thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                  ios_backgroundColor="#E5E5EA"
                  style={Platform.OS === 'android'? { transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] } : { transform: [{ scaleX: 1 }, { scaleY: 1 }] }}
                />
              </View>
            </View>
            <TouchableOpacity onPress={toggleSearch} style={styles.searchButton}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path 
                  stroke={theme === 'light' ? '#000' : '#fff'} 
                  d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
                />
              </Svg>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Ulubione</Text>
              <Switch value={favoritesOnly} onValueChange={toggleFavoriteSwitch} trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                      thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                      ios_backgroundColor="#E5E5EA"
                      style={Platform.OS === 'android'? { transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] } : { transform: [{ scaleX: 1 }, { scaleY: 1 }] }}
                      />
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Presety</Text>
              <Switch
                value={presetsSwitch}
                onValueChange={(v) => {
                  setPresetsSwitch(v);
                  if (v) nav.navigate('PresetList');
                }}
                trackColor={{ false: '#E5E5EA', true: '#1E40AF' }}
                thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                ios_backgroundColor="#E5E5EA"
                style={Platform.OS === 'android'? { transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] } : { transform: [{ scaleX: 1 }, { scaleY: 1 }] }}
              />
            </View>
            <TouchableOpacity onPress={toggleSearch} style={styles.searchButton}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path 
                  stroke={theme === 'light' ? '#000' : '#fff'} 
                  d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
                />
              </Svg>
            </TouchableOpacity>
          </>
        )}
      </View>

      {songCount === 0 && (
      <TouchableOpacity style={styles.button} onPress={fetchSongsFromAPI}>
        <Text style={styles.buttonText}>Pobierz piosenki</Text>
      </TouchableOpacity>
      )}

      {isSearchVisible && <SongSearch searchQuery={searchQuery} onSearchChange={handleSearchChange} />}
      
      <SongList 
      key={songs.length}
      selectedCategory={selectedCategory} 
      favoritesOnly={favoritesOnly} 
      favoriteSongIds={favoriteSongIds} 
      updateFavorites={updateFavorites}
      searchQuery={searchQuery}  />
    </View>
  );
};


const lightStyles = (isTablet: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    padding: isTablet ? 40 : 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: isTablet ? 32 : 24,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
  },
  switches:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: isTablet? 20:16,
    marginRight: 10,
    color: '#000000',
  },
  presetsButton: {
    marginLeft: 12,
    paddingVertical: isTablet ? 10 : 8,
    paddingHorizontal: isTablet ? 14 : 12,
    backgroundColor: '#1E40AF',
    borderRadius: 999,
  },
  presetsButtonText: {
    color: '#ffffff',
    fontSize: isTablet ? 18 : 14,
    fontWeight: '600',
  },
  searchButton: {
    width: isTablet ? 50 : 40,
    height: isTablet ? 50 : 32,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
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
    fontSize: isTablet? 20:16,
    fontWeight: 'bold',
  },
  songCount: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#000000',
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
  presetsButton: {
    ...lightStyles(isTablet).presetsButton,
    backgroundColor: '#1E3A8A',
  },
  presetsButtonText: {
    ...lightStyles(isTablet).presetsButtonText,
    color: '#ffffff',
  },
  button: {
    ...lightStyles(isTablet).button,
    backgroundColor: '#1E40AF',
  },
  buttonText: {
    ...lightStyles(isTablet).buttonText,
    color: '#ffffff',
  },
  songCount: {
    ...lightStyles(isTablet).songCount,
    color: '#ffffff',
  },
});

export default HomeScreen;