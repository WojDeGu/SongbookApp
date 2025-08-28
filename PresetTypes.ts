export type MassSlot = 'wejscie' | 'dary' | 'komunia' | 'uwielbienie' | 'wyjscie';

export interface Preset {
  id: string;
  name: string;
  date?: string;
  notes?: string;
  songs: Partial<Record<MassSlot, number>>;
}
