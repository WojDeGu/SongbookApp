import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from './env.js';

const API_URL = env.API_URL;
const LOCAL_STORAGE_KEY = 'songbook.json';

const SongListChecker: React.FC = () => {
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const storedData = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
        const localSongs = storedData ? JSON.parse(storedData) : [];

        if(localSongs.length === 0){
          return;
        }

        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'User-Agent': env.USER_AGENT,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          throw new Error('Błąd pobierania listy piosenek');
        }

        const fetchedSongs = await response.json();

        if (localSongs.length !== fetchedSongs.length) {
          Alert.alert(
            'Aktualizacja dostępna',
            'Pobierz aktualną listę piosenek. Opcję znajdziesz w ustawieniach. Ustawienia (prawy górny róg) -> "Zaktualizuj listę piosenek"'
          );
        }
      } catch (error) {
        console.error('Błąd sprawdzania aktualizacji piosenek:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkForUpdates();
  }, []);

  return null;
};

export default SongListChecker;