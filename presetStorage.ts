import AsyncStorage from '@react-native-async-storage/async-storage';
import { Preset } from './PresetTypes';

const KEY = 'presets.v1';

export async function getPresets(): Promise<Preset[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function savePresets(list: Preset[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export async function upsertPreset(preset: Preset) {
  const list = await getPresets();
  const idx = list.findIndex(p => p.id === preset.id);
  if (idx >= 0) list[idx] = preset; else list.push(preset);
  await savePresets(list);
}

export async function deletePreset(id: string) {
  const list = await getPresets();
  await savePresets(list.filter(p => p.id !== id));
}
