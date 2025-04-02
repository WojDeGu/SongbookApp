import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from './ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
// Listy akordów
const majorChords = ['C', 'Cis', 'D', 'Dis', 'E', 'F', 'Fis', 'G', 'Gis', 'A', 'B', 'H'];
const minorChords = ['c', 'cis', 'd', 'dis', 'e', 'f', 'fis', 'g', 'gis', 'a', 'b', 'h'];

// Funkcja do transpozycji akordów w całym tekście
const transposeChord = (line: string, steps: number): string => {
  // const limitedSteps = Math.max(-11, Math.min(steps, 11)); Ograniczenie zmiany liczby transpozycji w funkcji

  return line.replace(/\b(Cis|Dis|Fis|Gis|cis|dis|fis|gis|[A-Ha-h])([#b]?m?\d*\+?\-?\w*)?\b/g, (match, root, suffix = '') => {
    const isMajor = majorChords.includes(root);
    const isMinor = minorChords.includes(root);
    if (!isMajor && !isMinor) return match;

    const chordsList = isMajor ? majorChords : minorChords;
    const index = chordsList.indexOf(root);
    const newIndex = (index + steps + chordsList.length) % chordsList.length;

    return chordsList[newIndex] + suffix;
  });
};

// Funkcja zmiany wielkości czcionki
const FontSizeAdjuster = ({ fontSize, setFontSize }: { fontSize: number; setFontSize: (size: number) => void }) => {
  const { theme } = useTheme();
  const styles = theme === 'light' ? lightStyles : darkStyles;
  return (
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={() => setFontSize(fontSize - 2)} style={styles.controlButton}>
          <Text style={styles.controlButtonText}>A-</Text>
        </TouchableOpacity>
        <Text style={styles.transposeText}>Czcionka</Text>
        <TouchableOpacity onPress={() => setFontSize(fontSize + 2)} style={styles.controlButton}>
          <Text style={styles.controlButtonText}>A+</Text>
        </TouchableOpacity>
      </View>
  );
};

// Komponent do obsługi gestami
const usePinchToZoom = (fontSize: number, setFontSize: (size: number) => void) => {
  const baseFontSize = useSharedValue(fontSize);

  const handlePinch = (scale: number) => {
    'worklet';
    baseFontSize.value = Math.max(10, Math.min(fontSize * scale, 50));
    runOnJS(setFontSize)(baseFontSize.value);
  };

  return Gesture.Pinch()
    .onBegin(() => {
      'worklet';
      baseFontSize.value = fontSize;
    })
    .onUpdate((event) => {
      handlePinch(event.scale);
    });
};

// Funkcja zmiany tonacji
const TransposeAdjuster = ({ transpose, setTranspose }: { transpose: number; setTranspose: (steps: number) => void }) => {
  const { theme } = useTheme();
  const styles = theme === 'light' ? lightStyles : darkStyles;
  return (
    <View style={styles.controlsContainer}>
      <TouchableOpacity onPress={() => setTranspose(Math.max(-11, transpose - 1))}
        style={[styles.controlButton, transpose <= -11 && styles.disabledButton]}
        disabled={transpose <= -11}>
        <Text style={styles.controlButtonText}>-</Text>
      </TouchableOpacity>
      <Text style={styles.transposeText}>Tonacja: {transpose > 0 ? `+${transpose}` : transpose}</Text>
      <TouchableOpacity onPress={() => setTranspose(Math.min(11, transpose + 1))}
        style={[styles.controlButton, transpose >= 11 && styles.disabledButton]}
        disabled={transpose >= 11}>
        <Text style={styles.controlButtonText}>+</Text>
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
  const [transpose, setTranspose] = useState<number>(0);
  const [showFontSizeAdjuster, setShowFontSizeAdjuster] = useState<boolean>(false);

  const { theme } = useTheme();
  const styles = theme === 'light' ? lightStyles : darkStyles;
  const pinchGesture = usePinchToZoom(fontSize, setFontSize);

  const renderSongContent = (content: { lyrics: string; chords?: string }[]) => {
    let isChorus = false;
    let chorusStartIndex: number | null = null;
  
    return content.map((item, index) => {
      const isChorusStart = /^Ref[\.:]/i.test(item.lyrics.trim());
      const isVerseStart = /^\d+\./.test(item.lyrics.trim());
      const isAuthor = /^\/\/(.+?)\/\/$/.test(item.lyrics.trim());
  
      if (isChorusStart) {
        isChorus = true;
        chorusStartIndex = index;
      }
  
      if (isChorus && isVerseStart) {
        isChorus = false;
      }
  
      return (
        <View 
          key={index} 
          style={[
            styles.songContentRow,
            index === chorusStartIndex ? { marginTop: 15 } : {}, // Odstęp przed refrenem
            isVerseStart && !isChorusStart ? { marginTop: 15 } : {} // Odstęp po refrenie przed zwrotką
          ]}
        >
          <Text style={[styles.songLyrics, { fontSize }, isChorus && { fontWeight: "bold" }, isAuthor && { fontStyle: "italic", fontWeight: "300", marginTop: 20 }]}>
            {item.lyrics || ''}
          </Text>
          <Text style={[styles.songChords, { fontSize }, isChorus && { fontWeight: "bold" }]}>
            {item.chords ? transposeChord(item.chords, transpose) : ''}
          </Text>
        </View>
      );
    });
  }

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
    const loadSettings = async () => {
      const storedValue = await AsyncStorage.getItem('showFontSizeAdjuster');
      if (storedValue !== null) {
        setShowFontSizeAdjuster(JSON.parse(storedValue));
      }
    };
    
    fetchSongDetail();
    loadSettings();
    const subscription = DeviceEventEmitter.addListener('updateFontSizeAdjuster', (value: boolean) => {
      setShowFontSizeAdjuster(value);
    });
    return () => {
      subscription.remove();
    };
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
    <GestureDetector gesture={pinchGesture}>
      <View style={{ backgroundColor: theme === 'dark' ? '#121212' : '#ffffff', flex: 1}}>
        <View>
          <View style={styles.header}>
            <Text style={styles.songName}>{songDetail?.name}</Text>
          </View>
          <Text style={styles.songCategory}>{songDetail?.category}</Text>
          {showFontSizeAdjuster && <FontSizeAdjuster fontSize={fontSize} setFontSize={setFontSize} /> }
          <TransposeAdjuster transpose={transpose} setTranspose={setTranspose} />
        </View>

        <FlatList
          style={{ backgroundColor: theme === 'dark' ? '#121212' : '#ffffff', flex: 1 }}
          data={songDetail?.content || []}
          keyExtractor={(item, index) => index.toString()}
          renderItem={() => null}
          ListFooterComponent={<View>{renderSongContent(songDetail?.content || [])}</View>}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </GestureDetector>
  );
};

const lightStyles = StyleSheet.create({
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  controlButton: {
    padding: 5,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  transposeControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  transposeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888888',
    marginHorizontal: 10,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 20,
    marginTop: 15,
  },
  songName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  songCategory: {
    fontSize: 18,
    marginVertical: 10,
    color: '#666666',
    textAlign: 'center',
  },
  songContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    marginBottom: 10,
  },
  songNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#333333',
  },
  songLyrics: {
    flex: 3,
    fontSize: 16,
    textAlign: 'left',
    color: '#111111',
  },
  songChords: {
    flex: 1,
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'right',
    marginLeft: 10,
    color: '#005BBB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#222222',
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
    backgroundColor: '#121212',
  },
  header: {
    ...lightStyles.header,
    backgroundColor: '#1E40AF',
  },
  songCategory: {
    ...lightStyles.songCategory,
    color: '#bbbbbb',
  },
  controlButton: {
    ...lightStyles.controlButton,
    backgroundColor: '#1E40AF',
  },
  transposeText: {
    ...lightStyles.transposeText,
    color: 'white',
  },
  songNumber: {
    ...lightStyles.songNumber,
    color: '#FFA726',
  },
  songLyrics: {
    ...lightStyles.songLyrics,
    color: '#DDDDDD',
  },
  songChords: {
    ...lightStyles.songChords,
    color: '#FFCC00',
  },
  loadingText: {
    color: '#E0E0E0',
  },
  error: {
    color: 'red',
  },
});

export default SongDetail;