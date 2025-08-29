import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MassSlot, Preset } from './PresetTypes';
import { getPresets, deletePreset } from './presetStorage';
import { useTheme } from './ThemeContext';

type RouteParams = { id: string };

const SLOT_LABELS: Record<MassSlot, string> = {
  wejscie: 'Wejście',
  dary: 'Dary',
  komunia: 'Komunia',
  uwielbienie: 'Uwielbienie',
  wyjscie: 'Wyjście',
  inne1: 'Inne 1',
  inne2: 'Inne 2',
  inne3: 'Inne 3',
};

type Song = { id: number; name: string; category?: string };

const PresetDetailScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params as RouteParams;

  const [preset, setPreset] = useState<Preset | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const load = React.useCallback(async () => {
    const [all, stored] = await Promise.all([
      getPresets(),
      AsyncStorage.getItem('songbook.json'),
    ]);
    setPreset(all.find(p => p.id === id) || null);
    setSongs(stored ? JSON.parse(stored) : []);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useFocusEffect(
    React.useCallback(() => {
      load();
      return () => {};
    }, [load])
  );

  const songMap = useMemo(() => {
    const map: Record<number, Song> = {};
    songs.forEach(s => (map[s.id] = s));
    return map;
  }, [songs]);

  const slotsBase: MassSlot[] = ['wejscie', 'dary', 'komunia', 'uwielbienie', 'wyjscie'];
  const inneSlots: MassSlot[] = ['inne1', 'inne2', 'inne3'];
  const slots: MassSlot[] = useMemo(() => {
    // Always show the base five; for Inne show only those that are assigned
    const assignedInne = inneSlots.filter(s => !!preset?.songs?.[s]);
    return assignedInne.length ? [...slotsBase, ...assignedInne] : slotsBase;
  }, [preset?.songs]);

  const styles = theme === 'light' ? lightStyles(isTablet) : darkStyles(isTablet);

  return (
    <View style={styles.root}>
      <ScrollView style={styles.page} contentContainerStyle={styles.container}>
        {!preset && <Text style={styles.info}>Nie znaleziono presetu.</Text>}
        {preset && (
          <View>
            {slots.map(s => {
              const songId = preset.songs[s];
              const song = songId ? songMap[songId] : undefined;
              const RowComponent: any = song ? TouchableOpacity : View;
              const onPress = song ? () => nav.navigate('SongDetail', { songId: song.id }) : undefined;
              return (
                <RowComponent key={s} style={styles.row} onPress={onPress} activeOpacity={0.7} accessibilityRole={song ? 'button' : undefined}>
                  <Text style={styles.slotLabel}>{SLOT_LABELS[s]}</Text>
                  <View style={styles.valueWrap}>
                    {song ? (
                      <Text style={styles.songName} numberOfLines={1} ellipsizeMode="tail">{song.name}</Text>
                    ) : (
                      <Text style={styles.missing} numberOfLines={1} ellipsizeMode="tail">Brak piosenki</Text>
                    )}
                  </View>
                </RowComponent>
              );
            })}
          </View>
        )}
      </ScrollView>
      {preset && (
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity style={styles.buttonBlue} onPress={() => nav.navigate('PresetEditor', { id })}>
            <Text style={styles.buttonText}>Edytuj</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonRed}
            onPress={() =>
              Alert.alert('Usunąć preset?', 'Tej operacji nie można cofnąć.', [
                { text: 'Anuluj', style: 'cancel' },
                {
                  text: 'Usuń',
                  style: 'destructive',
                  onPress: async () => {
                    await deletePreset(id);
                    nav.goBack();
                  },
                },
              ])
            }
          >
            <Text style={styles.buttonText}>Usuń</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const base = {
  root: { flex: 1 },
  page: {},
  container: { padding: 16, paddingBottom: 130, flexGrow: 1 },
  info: {},
  bottomButtonsContainer: { position: 'absolute' as 'absolute', bottom: 10, left: 0, right: 0, padding: 15 },
  buttonBlue: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' as 'center', marginVertical: 8 },
  buttonRed: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' as 'center', marginVertical: 8 },
  buttonText: { color: '#ffffff', fontWeight: '700' as '700' },
  row: { flexDirection: 'row' as 'row', alignItems: 'center' as 'center', justifyContent: 'space-between' as 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  slotLabel: { fontWeight: '700' as '700', fontSize: 16 },
  valueWrap: { flex: 1, alignItems: 'flex-end' as 'flex-end', marginLeft: 12 },
  songName: { fontWeight: '600' as '600', fontSize: 16, textAlign: 'right' as 'right' },
  missing: {},
};

const lightStyles = (isTablet: boolean) => StyleSheet.create({
  root: { ...base.root, backgroundColor: '#ffffff' },
  page: { ...base.page, backgroundColor: '#ffffff' },
  container: { ...base.container, padding: isTablet ? 40 : 16, paddingBottom: isTablet ? 150 : 130 },
  info: { color: '#555' },
  bottomButtonsContainer: { ...base.bottomButtonsContainer, bottom: isTablet ? 20 : 10, padding: isTablet ? 20 : 15 },
  buttonBlue: { ...base.buttonBlue, backgroundColor: '#007bff', paddingVertical: isTablet ? 14 : 12 },
  buttonRed: { ...base.buttonRed, backgroundColor: '#ef4444', paddingVertical: isTablet ? 14 : 12 },
  buttonText: { ...base.buttonText, fontSize: isTablet ? 18 : 16 },
  row: { ...base.row, borderBottomColor: '#eee', paddingVertical: isTablet ? 16 : 12},
  slotLabel: { ...base.slotLabel, color: '#111', fontSize: isTablet ? 20 : 16 },
  valueWrap: { ...base.valueWrap },
  songName: { ...base.songName, color: '#1e40af', fontSize: isTablet ? 18 : 16 },
  missing: { color: '#999', fontSize: isTablet ? 18 : 16 },
});

const darkStyles = (isTablet: boolean) => StyleSheet.create({
  root: { ...base.root, backgroundColor: '#121212' },
  page: { ...base.page, backgroundColor: '#121212' },
  container: { ...base.container, padding: isTablet ? 30 : 16, paddingBottom: isTablet ? 150 : 130 },
  info: { color: '#c7c7c7' },
  bottomButtonsContainer: { ...base.bottomButtonsContainer, bottom: isTablet ? 20 : 10, padding: isTablet ? 20 : 15 },
  buttonBlue: { ...base.buttonBlue, backgroundColor: '#1E40AF', paddingVertical: isTablet ? 14 : 12 },
  buttonRed: { ...base.buttonRed, backgroundColor: '#b91c1c', paddingVertical: isTablet ? 14 : 12 },
  buttonText: { ...base.buttonText, fontSize: isTablet ? 18 : 16 },
  row: { ...base.row, borderBottomColor: '#333', paddingVertical: isTablet ? 16 : 12,},
  slotLabel: { ...base.slotLabel, color: '#ffffff', fontSize: isTablet ? 20 : 16 },
  valueWrap: { ...base.valueWrap },
  songName: { ...base.songName, color: '#93c5fd', fontSize: isTablet ? 18 : 16 },
  missing: { color: '#888', fontSize: isTablet ? 18 : 16 },
});

export default PresetDetailScreen;
