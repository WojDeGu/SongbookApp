import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';

interface FavoriteButtonProps {
  songId: number;
  onToggleFavorite: (songId: number, isFavorite: boolean) => void;
  isFavorite: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ songId, onToggleFavorite, isFavorite }) => {
  const handlePress = () => {
    onToggleFavorite(songId, !isFavorite);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.button}>
      {isFavorite ? (
        <Svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <Path
            fill="#ff4081"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </Svg>
      ) : (
        <Svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <Path
            fill="#ccc"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </Svg>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
  },
});

export default FavoriteButton;