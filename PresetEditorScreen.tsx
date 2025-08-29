import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { Preset, MassSlot } from './PresetTypes';
import { getPresets, upsertPreset } from './presetStorage';
import { useTheme } from './ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RouteParams = { id: string; pickedSong?: number; slot?: MassSlot };

const SLOT_LABELS: Record<MassSlot, string> = {
  wejscie: 'Wejście',
  dary: 'Dary',
  komunia: 'Komunia',
  uwielbienie: 'Uwielbienie',
  wyjscie: 'Wyjście',
};

const PresetEditorScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { id, pickedSong, slot } = route.params as RouteParams;

  const [preset, setPreset] = useState<Preset>({ id, name: 'Nowy preset', songs: {} });
  const [songNames, setSongNames] = useState<Record<number, string>>({});
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const styles = theme === 'light' ? lightStyles(isTablet) : darkStyles(isTablet);

  useEffect(() => {
    (async () => {
      const all = await getPresets();
      const found = all.find(p => p.id === id);
      if (found) setPreset(found);
  const stored = await AsyncStorage.getItem('songbook.json');
  const list: Array<{ id: number; name: string }> = stored ? JSON.parse(stored) : [];
  const map: Record<number, string> = {};
  list.forEach(s => (map[s.id] = s.name));
  setSongNames(map);
    })();
  }, [id]);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const all = await getPresets();
        const found = all.find(p => p.id === id);
        if (found) setPreset(found);
      })();
    }, [id])
  );

  useEffect(() => {
    (async () => {
      const params = route.params as RouteParams;
      if (typeof params?.pickedSong === 'number' && params?.slot) {
        const all = await getPresets();
        const latest = all.find(p => p.id === id) || preset;
        const updated: Preset = { ...latest, songs: { ...latest.songs, [params.slot]: params.pickedSong } };
        setPreset(updated);
        await upsertPreset(updated);
        nav.setParams({ pickedSong: undefined, slot: undefined });
      }
    })();
  }, [route.params]);

  const pickSong = (s: MassSlot) => {
    nav.navigate('SongPicker', { presetId: id, slot: s });
  };

  const save = async () => {
    await upsertPreset(preset);
    if (nav.canGoBack()) {
      nav.goBack();
    } else {
      nav.navigate('PresetList');
    }
  };

  const slots: MassSlot[] = ['wejscie', 'dary', 'komunia', 'uwielbienie', 'wyjscie'];

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nazwa presetu</Text>
      <TextInput
        style={styles.input}
        value={preset.name}
        onChangeText={name => setPreset({ ...preset, name })}
        placeholder="Nazwa..."
      />
      <Text style={styles.label}>Komentarz (opcjonalnie)</Text>
      <TextInput
        style={styles.commentInput}
        value={preset.date || ''}
        onChangeText={date => setPreset({ ...preset, date })}
        placeholder="Komentarz"
      />
      {slots.map(s => (
        <View key={s} style={styles.slotRow}>
          <Text style={styles.slotLabel}>{SLOT_LABELS[s]}</Text>
          <TouchableOpacity style={styles.pickBtn} onPress={() => pickSong(s)}>
            <Text style={styles.pickText}>
              {preset.songs[s] ? songNames[preset.songs[s] as number] || `ID: ${preset.songs[s]}` : 'Wybierz piosenkę'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.save} onPress={save}>
        <Text style={styles.saveText}>Zapisz preset</Text>
      </TouchableOpacity>
  </ScrollView>
  );
};

const base = {
  page: {},
  container: { padding: 16, flexGrow: 1 },
  label: { fontWeight: '600' as '600', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10 },
  slotRow: { flexDirection: 'row' as 'row', alignItems: 'center' as 'center', justifyContent: 'space-between' as 'space-between', marginTop: 12 },
  slotLabel: { fontSize: 16, fontWeight: '600' as '600' },
  pickBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  pickText: {},
  save: { marginTop: 24, padding: 14, borderRadius: 10 },
  saveText: { textAlign: 'center' as 'center', fontWeight: '700' as '700' },
};

const lightStyles = (isTablet: boolean) => StyleSheet.create({
  page: { ...base.page, backgroundColor: '#ffffff' },
  container: { ...base.container, padding: isTablet ? 24 : 16 },
  label: { ...base.label, color: '#111', fontSize: isTablet ? 18 : 16 },
  input: { ...base.input, borderColor: '#ccc', backgroundColor: '#ffffff', color: '#111', padding: isTablet ? 14 : 10, fontSize: isTablet ? 18 : 16 },
  commentInput: { ...base.input, borderColor: '#ccc', backgroundColor: '#ffffff', color: '#111', padding: isTablet ? 14 : 10, fontSize: isTablet ? 18 : 16 },
  slotRow: { ...base.slotRow, marginTop: isTablet ? 16 : 12 },
  slotLabel: { ...base.slotLabel, color: '#111', fontSize: isTablet ? 20 : 16 },
  pickBtn: { ...base.pickBtn, backgroundColor: '#eee', paddingVertical: isTablet ? 12 : 10, paddingHorizontal: isTablet ? 16 : 12 },
  pickText: { ...base.pickText, color: '#111', fontSize: isTablet ? 18 : 16 },
  save: { ...base.save, backgroundColor: '#007bff', padding: isTablet ? 18 : 14 },
  saveText: { ...base.saveText, color: '#ffffff', fontSize: isTablet ? 22 : 16 },
});

const darkStyles = (isTablet: boolean) => StyleSheet.create({
  page: { ...base.page, backgroundColor: '#121212' },
  container: { ...base.container, padding: isTablet ? 24 : 16 },
  label: { ...base.label, color: '#ffffff', fontSize: isTablet ? 18 : 16 },
  input: { ...base.input, borderColor: '#2b2b2b', backgroundColor: '#1c1c1c', color: '#ffffff', padding: isTablet ? 14 : 10, fontSize: isTablet ? 18 : 16 },
  commentInput: { ...base.input, borderColor: '#2b2b2b', backgroundColor: '#1c1c1c', color: '#ffffff', padding: isTablet ? 14 : 10, fontSize: isTablet ? 18 : 16 },
  slotRow: { ...base.slotRow, marginTop: isTablet ? 16 : 12 },
  slotLabel: { ...base.slotLabel, color: '#ffffff', fontSize: isTablet ? 20 : 16 },
  pickBtn: { ...base.pickBtn, backgroundColor: '#2a2a2a', paddingVertical: isTablet ? 12 : 10, paddingHorizontal: isTablet ? 16 : 12 },
  pickText: { ...base.pickText, color: '#ffffff', fontSize: isTablet ? 18 : 16 },
  save: { ...base.save, backgroundColor: '#1E3A8A', padding: isTablet ? 18 : 14 },
  saveText: { ...base.saveText, color: '#ffffff', fontSize: isTablet ? 22 : 16 },
});

export default PresetEditorScreen;
