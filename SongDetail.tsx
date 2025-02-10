import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from './ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Typowanie parametrów nawigacji
type RootStackParamList = {
  HomeScreen: undefined;
  SongDetail: { songId: number };
};

interface Song {
  id: number;
  name: string;
  category: string;
  content: { lyrics: string; chords?: string }[];
}

interface SongDetailProps {
  route: RouteProp<RootStackParamList, 'SongDetail'>;
}

const SongDetail: React.FC<SongDetailProps> = ({ route }) => {
  const { songId } = route.params;
  const [songDetail, setSongDetail] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { theme } = useTheme();
  const styles = theme === 'light' ? lightStyles : darkStyles;

  useEffect(() => {
    const fetchSongDetail = async () => {
      try {
        const storedSongs = await AsyncStorage.getItem('songbook.json');
        if (storedSongs) {
          const songs: Song[] = JSON.parse(storedSongs);
          const selectedSong = songs.find(song => song.id === songId);
          if (selectedSong) {
            setSongDetail(selectedSong);
          } else {
            setError('Nie znaleziono piosenki.');
          }
        } else {
          setError('Brak zapisanych danych. Pobierz piosenki.');
        }
      } catch (error: any) {
        setError('Błąd podczas wczytywania szczegółów piosenki.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongDetail();
  }, [songId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme === 'dark' ? "#ffffff" : "#0000ff"} />
        <Text style={styles.loadingText}>Ładowanie...</Text>
      </View>
    );
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <FlatList
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <Text style={styles.songName}>{songDetail?.name}</Text>
          </View>
          <Text style={styles.songCategory}>{songDetail?.category}</Text>
        </>
      }
      data={songDetail?.content || []}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item, index }) => (
        <View style={styles.songContentRow}>
          <Text style={styles.songNumber}>{index + 1}</Text>
          <Text style={styles.songLyrics}>{item.lyrics || ''}</Text>
          <Text style={styles.songChords}>{item.chords || ''}</Text>
        </View>
      )}
      contentContainerStyle={styles.container}
    />
  );
  
};

const baseStyles = {
  container: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row', 
    justifyContent: 'center', // Wyśrodkowanie zawartości w poziomie
    alignItems: 'center', // Wyśrodkowanie zawartości w pionie
    backgroundColor: '#FF914D',
    padding: 15,
    borderRadius: 5,
    width: '100%', // Upewnia się, że zajmuje całą szerokość
  },
  
  songName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center', // Wyśrodkowanie tekstu wewnątrz elementu
    flexShrink: 1, // Zapobiega wychodzeniu poza ekran
  },
  songCategory: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
  },
  songContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Wyrównanie górne
    marginBottom: 10,
  },
  songNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    alignSelf: 'center',
  },
  songLyrics: {
    flex: 3, // Większy udział w przestrzeni
    fontSize: 16,
    textAlign: 'left',
    flexWrap: 'wrap', // Zawijanie tekstu
  },
  songChords: {
    flex: 1, // Mniejszy udział w przestrzeni
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'right',
    alignSelf: 'center', // Wyśrodkowanie w pionie względem tekstu
    marginLeft: 10,
  },
};

const lightStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row', 
    justifyContent: 'center', // Wyśrodkowanie zawartości w poziomie
    alignItems: 'center', // Wyśrodkowanie zawartości w pionie
    backgroundColor: '#FF914D',
    padding: 15,
    borderRadius: 5,
    width: '100%', // Upewnia się, że zajmuje całą szerokość
  },
  
  songName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center', // Wyśrodkowanie tekstu wewnątrz elementu
    flexShrink: 1, // Zapobiega wychodzeniu poza ekran
  },
  songCategory: {
    fontSize: 18,
    marginBottom: 10,
    color: '#888888',
    textAlign: 'center',
  },
  songNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#000000',
    alignSelf: 'center',
  },
  songLyrics: {
    flex: 1,
    fontSize: 16,
    marginVertical: 5,
    color: '#000000',
    flexShrink: 1,
    flexWrap: 'wrap', // Pozwala na zawijanie tekstu
    textAlign: 'left',
  },
  songChords: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#000000',
    textAlign: 'right',
    alignSelf: 'center', // Centrowanie akordów na wysokości tekstu
    marginLeft: 10,
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
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
    color: 'darkred',
  },
  songContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Obsługa zawijania tekstu
    marginBottom: 5,
  },
  songContentList: {
    marginTop: 10,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row', 
    justifyContent: 'center', // Wyśrodkowanie zawartości w poziomie
    alignItems: 'center', // Wyśrodkowanie zawartości w pionie
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 5,
    width: '100%', // Upewnia się, że zajmuje całą szerokość
  },
  
  songName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffcc00',
    textAlign: 'center', // Wyśrodkowanie tekstu wewnątrz elementu
    flexShrink: 1, // Zapobiega wychodzeniu poza ekran
  },
  songCategory: {
    fontSize: 18,
    marginBottom: 10,
    color: '#ffcc00',
    textAlign: 'center',
  },
  songNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#ffcc00',
    alignSelf: 'center',
  },
  songLyrics: {
    flex: 1,
    fontSize: 16,
    marginVertical: 5,
    color: '#ffffff',
    flexShrink: 1,
    flexWrap: 'wrap', // Pozwala na zawijanie tekstu
    textAlign: 'left',
  },
  songChords: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#ffcc00',
    textAlign: 'right',
    alignSelf: 'center', // Centrowanie akordów na wysokości tekstu
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#ffffff',
  },
  error: {
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
    color: 'red',
  },
  songContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Obsługa zawijania tekstu
    marginBottom: 5,
  },
  songContentList: {
    marginTop: 10,
  },
});


export default SongDetail;