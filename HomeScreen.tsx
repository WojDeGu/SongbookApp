import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import CategoryPicker from './CategoryPicker';
import SongList from './SongList';
import { useTheme } from './ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SongSearch from './SongSearch';
import AdBanner from './AdBanner';
import { Svg, Path } from 'react-native-svg';

const API_URL = 'https://songbook.slowkodaje.pl/api.php';
const LOCAL_STORAGE_KEY = 'songbook.json';

const HomeScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const { theme, toggleTheme } = useTheme();
  const [favoriteSongIds, setFavoriteSongIds] = useState<number[]>([]);
  const [songCount, setSongCount] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [songs, setSongs] = useState<any[]>([]);

  useEffect(() => {
    loadFavoritesOnly();
    loadFavoriteSongs();
    checkLocalData();
  }, []);

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
          'User-Agent': 'SongbookApp',
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

  const styles = theme === 'light' ? lightStyles : darkStyles;
  
  return (
    <View style={styles.container}>
      <AdBanner />
      <Text style={styles.title}>Wybierz kategorię</Text>
      <CategoryPicker selectedCategory={selectedCategory} onSelectCategory={handleCategoryChange} />
      <View style={styles.switches}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Ulubione</Text>
          <Switch value={favoritesOnly} onValueChange={toggleFavoriteSwitch} />
        </View>

        <TouchableOpacity onPress={toggleSearch} style={styles.searchButton}>
          <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path 
              stroke={theme === 'light' ? '#000' : '#fff'} 
              d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
            />
          </Svg>
        </TouchableOpacity>
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


const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 10,
    color: '#000000',
  },
  searchButton: {
    width: 40,
    height: 32,
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
  buttonText: {
    ...lightStyles.buttonText,
    color: '#ffffff',
  },
  songCount: {
    ...lightStyles.songCount,
    color: '#ffffff',
  },
});

export default HomeScreen;