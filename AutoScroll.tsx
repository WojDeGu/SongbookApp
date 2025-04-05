import React, { useState, useRef } from 'react';
import { View, Text, Platform, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from './ThemeContext';

interface AutoScrollProps {
  onStart: (speed: number) => void;
  onStop: () => void;
}

const AutoScroll: React.FC<AutoScrollProps> = ({ onStart, onStop }) => {
  const [speed, setSpeed] = useState(0.5);
  const scrollSpeedRef = useRef(speed);

  const handleStart = () => {
    scrollSpeedRef.current = speed;
    onStart(scrollSpeedRef.current);
  };

  const handleStop = () => {
    onStop();
  };

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { theme, toggleTheme } = useTheme();
  const styles = theme === 'light' ? lightStyles(isTablet) : darkStyles(isTablet);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Prędkość przewijania: {speed.toFixed(2)}</Text>
      <Slider
        style={styles.slider}
        minimumValue={0.1}
        maximumValue={2}
        value={speed}
        step={0.1}
        onValueChange={setSpeed}
        minimumTrackTintColor = {theme === 'light' ? "#007AFF" : "#1E40AF"}
        maximumTrackTintColor="#ccc"
        thumbTintColor={theme === 'light' ? "#007AFF" : "#1E40AF"}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonBlue} onPress={handleStart}>
            <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonBlue} onPress={handleStop}>
            <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const lightStyles = (isTablet: boolean) => StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  buttonContainer:{
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: isTablet? 24:18,
    fontWeight: 700,
    textAlign: 'center',
    color: 'black'
  },
  slider: {
    width: '100%',
    height: Platform.OS === 'android'? 40:10,
    marginVertical: Platform.OS === 'android' ? isTablet?10:0 : 0,
  },
  buttonBlue:{
    padding: 5,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  buttonText:{
    color: 'white',
    fontSize: isTablet? 24:18,
    fontWeight: '600',
  }
});
const darkStyles = (isTablet: boolean) => StyleSheet.create({
    ...lightStyles(isTablet),
    label:{
    ...lightStyles(isTablet).label,
    color: 'white',
    },
    buttonBlue:{
    ...lightStyles(isTablet).buttonBlue,
    backgroundColor: '#1E40AF',
    },
    buttonText:{
    ...lightStyles(isTablet).buttonText,

    }
});

export default AutoScroll;