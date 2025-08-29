export type MassSlot =
  | 'wejscie'
  | 'dary'
  | 'komunia'
  | 'uwielbienie'
  | 'wyjscie'
  | 'inne1'
  | 'inne2'
  | 'inne3';

export interface Preset {
  id: string;
  name: string;
  date?: string;
  notes?: string;
  songs: Partial<Record<MassSlot, number>>;
}
