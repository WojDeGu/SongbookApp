import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
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

// Komponent do zmiany wielkości czcionki
const FontSizeAdjuster = ({ fontSize, setFontSize }: { fontSize: number; setFontSize: (size: number) => void }) => {
  return (
    <View style={styles.controlsContainer}>
      <TouchableOpacity onPress={() => setFontSize(fontSize + 2)} style={styles.controlButton}>
        <Text style={styles.controlButtonText}>A+</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setFontSize(fontSize - 2)} style={styles.controlButton}>
        <Text style={styles.controlButtonText}>A-</Text>
      </TouchableOpacity>
    </View>
  );
};

const SongDetail: React.FC<SongDetailProps> = ({ route }) => {
  const { songId } = route.params;
  const [songDetail, setSongDetail] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(16);

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
          {/* Dodane przyciski do zmiany wielkości czcionki */}
          <FontSizeAdjuster fontSize={fontSize} setFontSize={setFontSize} />
        </>
      }
      data={songDetail?.content || []}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item, index }) => (
        <View style={styles.songContentRow}>
          <Text style={[styles.songNumber, { fontSize }]}>{index + 1}</Text>
          <Text style={[styles.songLyrics, { fontSize }]}>{item.lyrics || ''}</Text>
          <Text style={[styles.songChords, { fontSize }]}>{item.chords || ''}</Text>
        </View>
      )}
      contentContainerStyle={styles.container}
    />
  );
};

// Stylowanie
const styles = StyleSheet.create({
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  controlButton: {
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

const lightStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#FF914D',
    padding: 15,
    borderRadius: 5,
  },
  songName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  songCategory: {
    fontSize: 18,
    marginVertical: 10,
    color: '#888888',
    textAlign: 'center',
  },
  songContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  songNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#000000',
  },
  songLyrics: {
    flex: 3,
    fontSize: 16,
    textAlign: 'left',
  },
  songChords: {
    flex: 1,
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'right',
    marginLeft: 10,
  },
  // **Dodane brakujące style**
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
    color: 'red',
  },
});

const darkStyles = StyleSheet.create({
  ...lightStyles,
  container: {
    ...lightStyles.container,
    backgroundColor: '#000000',
  },
  songName: {
    ...lightStyles.songName,
    color: '#fffff',
  },
  songCategory: {
    ...lightStyles.songCategory,
    color: '#ffcc00',
  },
  songNumber: {
    ...lightStyles.songNumber,
    color: '#ffcc00',
  },
  songLyrics: {
    ...lightStyles.songLyrics,
    color: '#ffffff',
  },
  songChords: {
    ...lightStyles.songChords,
    color: '#ffcc00',
  },
  loadingText: {
    color: '#ffffff',
  },
  error: {
    color: 'red',
  },
});

export default SongDetail;