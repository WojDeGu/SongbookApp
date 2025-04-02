import React, { useState, useEffect } from 'react';
import { View, Text, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoriteSwitchProps {
  onChangeFavorites: (favoriteSongIds: number[]) => void;
}

const FavoriteSwitch: React.FC<FavoriteSwitchProps> = ({ onChangeFavorites }) => {
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          const favoriteIds = JSON.parse(storedFavorites);
          onChangeFavorites(favoriteIds);
        }
      } catch (error) {
        console.error('Błąd przy ładowaniu listy ulubionych: ', error);
      }
    };

    if (favoritesOnly) {
      loadFavorites();
    } else {
      onChangeFavorites([]);
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