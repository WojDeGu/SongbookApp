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

// Export a single preset as an object suitable for writing to a file.
export function exportPreset(preset: Preset) {
  // include a small magic header and version so the app can recognise the file
  return {
    __preset_file: true,
    version: 1,
    exportedAt: new Date().toISOString(),
    meta: {
      id: preset.id,
      name: preset.name,
      date: preset.date,
      notes: preset.notes,
    },
    payload: preset,
  };
}

// Import preset object (parsed JSON) into storage; returns the upserted preset id
export async function importPresetFile(obj: any) {
  if (!obj || obj.__preset_file !== true) throw new Error('Invalid preset file');
  const preset: Preset = obj.payload;
  await upsertPreset(preset);
  return preset.id;
}
