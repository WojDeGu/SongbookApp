import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MassSlot } from './PresetTypes';
import SongSearch from './SongSearch';
import { useTheme } from './ThemeContext';
import CategoryPicker from './CategoryPicker';
import { getPresets, upsertPreset } from './presetStorage';

interface Song { id: number; name: string; category: string; }

const SongPickerScreen: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { presetId, slot } = route.params as { presetId: string; slot: MassSlot };
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('songbook.json');
      const list: Song[] = stored ? JSON.parse(stored) : [];
      setSongs(list.sort((a, b) => a.name.localeCompare(b.name)));
    })();
  }, []);

  const select = async (songId: number) => {
    const list = await getPresets();
    const existing = list.find(p => p.id === presetId);
    const updated = existing
      ? { ...existing, songs: { ...existing.songs, [slot]: songId } }
      : { id: presetId, name: 'Nowy preset', songs: { [slot]: songId } } as any;
    await upsertPreset(updated);
    nav.goBack();
  };

  const getText = useCallback((it: Song) => it.name, []);
  const onResultsCallback = useCallback((res: Song[]) => setFilteredSongs(res), [setFilteredSongs]);

  const styles = theme === 'light' ? lightStyles(isTablet) : darkStyles(isTablet);
  return (
    <View style={styles.container}> 
      <View style={styles.searchWrap}>
        <CategoryPicker selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        <SongSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          items={songs}
          getText={getText}
          category={selectedCategory}
          onResults={onResultsCallback}
        />
      </View>
      <FlatList
        data={filteredSongs}
        keyExtractor={i => i.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => select(item.id)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.cat}>{item.category}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const base = {
  container: { flex: 1 },
  searchWrap: { padding: 12 },
  row: { padding: 12, borderBottomWidth: 1 },
  name: { fontWeight: '600' as '600' },
  cat: {},
};

const lightStyles = (isTablet: boolean) => StyleSheet.create({
  container: { ...base.container, backgroundColor: '#ffffff' },
  searchWrap: { ...base.searchWrap, padding: isTablet ? 20 : 12 },
  row: { ...base.row, borderBottomColor: '#ddd', padding: isTablet ? 16 : 12 },
  name: { ...base.name, color: '#111', fontSize: isTablet ? 20 : 16 },
  cat: { color: '#777', fontSize: isTablet ? 16 : 14 },
});

const darkStyles = (isTablet: boolean) => StyleSheet.create({
  container: { ...base.container, backgroundColor: '#121212' },
  searchWrap: { ...base.searchWrap, padding: isTablet ? 20 : 12 },
  row: { ...base.row, borderBottomColor: '#333', padding: isTablet ? 16 : 12 },
  name: { ...base.name, color: '#ffffff', fontSize: isTablet ? 20 : 16 },
  cat: { color: '#aaa', fontSize: isTablet ? 16 : 14 },
});

export default SongPickerScreen;
