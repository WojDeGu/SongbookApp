import React, { useState, useEffect } from 'react';
import { View, Text, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoriteSwitchProps {
  onChangeFavorites: (favoriteSongIds: number[]) => void;
}

const FavoriteSwitch: React.FC<FavoriteSwitchProps> = ({ onChangeFavorites }) => {
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);

  // Ładowanie listy ulubionych piosenek
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          const favoriteIds = JSON.parse(storedFavorites);
          onChangeFavorites(favoriteIds); // Przekazujemy listę ulubionych do rodzica
        }
      } catch (error) {
        console.error('Błąd przy ładowaniu listy ulubionych: ', error);
      }
    };

    if (favoritesOnly) {
      loadFavorites(); // Wczytujemy ulubione tylko, gdy przełącznik jest włączony
    } else {
      onChangeFavorites([]); // Jeśli przełącznik jest wyłączony, przekazujemy pustą listę
    }
  }, [favoritesOnly, onChangeFavorites]);

  const handleToggleFavoriteSwitch = () => {
    setFavoritesOnly(prevState => !prevState);
  };

  return (
    <View>
      <Text>Pokaż tylko ulubione</Text>
      <Switch value={favoritesOnly} onValueChange={handleToggleFavoriteSwitch} />
    </View>
  );
};

export default FavoriteSwitch;