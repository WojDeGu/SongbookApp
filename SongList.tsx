import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './App';
import { useTheme } from './ThemeContext';
import FavoriteButton from './FavoriteButton';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SongLine {
  lyrics: string;
  chords?: string;
}

interface Song {
  id: number;
  name: string;
  category: string;
  isFavorite: boolean;
  content?: SongLine[];
}

interface SongListProps {
  selectedCategory: string | null;
  favoritesOnly: boolean;
  favoriteSongIds: number[];
  updateFavorites: (favoriteIds: number[]) => void;
  searchQuery: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'SongDetail'>;

const SongList: React.FC<SongListProps> = ({ selectedCategory, favoritesOnly, favoriteSongIds, updateFavorites, searchQuery }) => {
  const [songs, setSongs] = useState<Song[]>(() => []);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();
  const [storedData, setStoredData] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const { theme } = useTheme();
  const styles = theme === 'light' ? lightStyles(isTablet) : darkStyles(isTablet);

  useEffect(() => {
    const loadSongs = async () => {
      try {
        const storedSongs = await AsyncStorage.getItem('songbook.json');
        setStoredData(storedSongs);
        if (storedSongs) {
          setSongs(JSON.parse(storedSongs));
        } else {
          setError('Brak zapisanych danych. Pobierz piosenki.');
        }
      } catch (error: any) {
        setError('Błąd podczas wczytywania piosenek.');
      } finally {
        setIsLoading(false);
      }
    };
  
    loadSongs();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const loadSongs = async () => {
        try {
          const storedSongs = await AsyncStorage.getItem('songbook.json');
          if (storedSongs) {
            setSongs(JSON.parse(storedSongs));
          }
        } catch (error) {
          console.error('Błąd przy wczytywaniu piosenek:', error);
        }
      };
      loadSongs();
    }, [])
  );
  
  const filteredSongs = (songs || []).filter(song => {
    if (favoritesOnly && !favoriteSongIds.includes(song.id)) {
      return false;
    }

    if (selectedCategory && song.category !== selectedCategory) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();

      const normalize = (text: string) => text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '').replace(/\s{2,}/g, ' ').trim();

      const normalizedQuery = normalize(searchQuery);

      const nameMatch = normalize(song.name).includes(normalizedQuery);
      const categoryMatch = normalize(song.category || '').includes(normalizedQuery);
      const lyricsMatch = song.content?.some((line: SongLine) =>
        normalize(line.lyrics || '').includes(normalizedQuery)
      );

      if (!nameMatch && !categoryMatch && !lyricsMatch) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const handlePress = (songId: number) => {
    navigation.navigate('SongDetail', { songId });
  };

  const handleToggleFavorite = (songId: number) => {
    const newFavoriteSongIds = favoriteSongIds.includes(songId)
      ? favoriteSongIds.filter(id => id !== songId)
      : [...favoriteSongIds, songId];

    updateFavorites(newFavoriteSongIds);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme === 'dark' ? '#ffffff' : '#0000ff'} />
        <Text style={styles.loadingText}>Ładowanie...</Text>
      </View>
    );
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <FlatList
      key={songs.length}
      data={filteredSongs}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.songItem} onPress={() => handlePress(item.id)}>
          <View style={styles.songTextContainer}>
            <Text style={styles.songName}>{item.name}</Text>
            <Text style={styles.songCategory}>{item.category}</Text>
          </View>
          <FavoriteButton
            songId={item.id}
            isFavorite={favoriteSongIds.includes(item.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        </TouchableOpacity>
      )}
    />
  );
};

const lightStyles = (isTablet: boolean) => StyleSheet.create({
  songTextContainer: {
    flex: 1,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#ffffff',
  },
  songName: {
    fontSize: isTablet? 24:18,
    fontWeight: 'bold',
    color: '#000000',
  },
  songCategory: {
    fontSize: isTablet? 20:16,
    color: '#888888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#000000',
  },
  error: {
    color: 'red',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
});

const darkStyles = (isTablet: boolean) => StyleSheet.create({
  ...lightStyles(isTablet),
  songItem: {
    ...lightStyles(isTablet).songItem,
    borderBottomColor: '#444',
    backgroundColor: '#121212',
  },
  songName: {
    ...lightStyles(isTablet).songName,
    color: 'white',
  },
  songCategory: {
    ...lightStyles(isTablet).songCategory,
    color: '#bbbbbb',
  },
  loadingText: {
    ...lightStyles(isTablet).loadingText,
    color: '#ffffff',
  },
});

export default SongList;