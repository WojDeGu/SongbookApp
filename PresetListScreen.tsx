import React, { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, BackHandler, useWindowDimensions } from 'react-native';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { Preset } from './PresetTypes';
import { useTheme } from './ThemeContext';
import { getPresets } from './presetStorage';
// lightweight id generator to avoid external deps
const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const PresetListScreen: React.FC = () => {
  const [data, setData] = useState<Preset[]>([]);
  const nav = useNavigation<any>();

  const load = async () => setData(await getPresets());

  useFocusEffect(
    React.useCallback(() => {
      load();
      const onHardwareBack = () => {
        if (nav.canGoBack()) {
          nav.goBack();
        } else {
          nav.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'HomeScreen' as never }] }));
        }
        return true;
      };
      const backSub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
      return () => { backSub.remove(); };
    }, [nav])
  );

  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const styles = theme === 'light' ? lightStyles(isTablet) : darkStyles(isTablet);

  // actions przeniesione do karty podglądu

  return (
    <View style={styles.container}>
  <TouchableOpacity style={styles.add} onPress={() => nav.navigate('PresetEditor', { id: genId() })}>
        <Text style={styles.addText}>Nowy preset</Text>
      </TouchableOpacity>

  <FlatList
        data={data}
        keyExtractor={i => i.id}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Pusta lista</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => nav.navigate('PresetDetail', { id: item.id })}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              {!!item.date && <Text style={styles.sub}>{item.date}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const base = {
  container: { flex: 1, padding: 12 },
  add: { padding: 14, borderRadius: 10, marginBottom: 10 },
  addText: { fontWeight: '800' as '800', textAlign: 'center' as 'center' },
  row: { flexDirection: 'row' as 'row', alignItems: 'center' as 'center', padding: 12, borderBottomWidth: 1 },
  name: { fontSize: 20, fontWeight: '600' as '600', textAlign: 'center' as 'center' },
  sub: { fontSize: 16, textAlign: 'center' as 'center', paddingTop: 8 },
  action: { marginLeft: 12, fontWeight: '600' as '600'},
};

const lightStyles = (isTablet: boolean) => StyleSheet.create({
  container: { ...base.container, backgroundColor: '#ffffff', padding: isTablet ? 30 : 20 },
  add: { ...base.add, backgroundColor: '#007bff', padding: isTablet ? 18 : 14 },
  addText: { ...base.addText, color: '#ffffff', fontSize: isTablet ? 20 : 16 },
  emptyWrap: { alignItems: 'center', paddingVertical: isTablet ? 40 : 24 },
  emptyText: { color: '#777', fontSize: isTablet ? 22 : 18 },
  row: { ...base.row, borderBottomColor: '#ddd', paddingVertical: isTablet ? 16 : 12, paddingHorizontal: isTablet ? 20 : 12 },
  name: { ...base.name, color: '#111', fontSize: isTablet ? 22 : 18 },
  sub: { ...base.sub, color: '#777', fontSize: isTablet ? 18 : 14 },
  action: { ...base.action, color: '#007bff' },
});

const darkStyles = (isTablet: boolean) => StyleSheet.create({
  container: { ...base.container, backgroundColor: '#121212', padding: isTablet ? 40 : 20 },
  add: { ...base.add, backgroundColor: '#1E3A8A', padding: isTablet ? 18 : 14 },
  addText: { ...base.addText, color: '#ffffff', fontSize: isTablet ? 20 : 16 },
  emptyWrap: { alignItems: 'center', paddingVertical: isTablet ? 40 : 24 },
  emptyText: { color: '#aaa', fontSize: isTablet ? 22 : 18 },
  row: { ...base.row, borderBottomColor: '#333', paddingVertical: isTablet ? 16 : 12, paddingHorizontal: isTablet ? 20 : 12 },
  name: { ...base.name, color: '#ffffff', fontSize: isTablet ? 22 : 18 },
  sub: { ...base.sub, color: '#aaa', fontSize: isTablet ? 18 : 14 },
  action: { ...base.action, color: '#93c5fd' },
});

export default PresetListScreen;
