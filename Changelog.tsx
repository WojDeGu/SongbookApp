import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeContext';

const APP_VERSION = "1.0.0";

const ChangelogModal = ({ isVisible, onClose }: { isVisible: boolean, onClose: () => void }) => {
  const { theme } = useTheme();
  const styles = theme === 'light' ? lightStyles : darkStyles;
  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Najnowsze zmiany</Text>
          <Text style={styles.changelogText}>
            - Poprawiono wydajność aplikacji{'\n'}
            - Zmiany wizualne{'\n'}
            - Dodano nowe piosenki - Zaktualizuj listę
          </Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Zamknij</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export const useChangelogModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkIfShouldShowModal = async () => {
      const lastVersion = await AsyncStorage.getItem('app_version');
      if (lastVersion !== APP_VERSION) {
        setIsVisible(true);
        await AsyncStorage.setItem('app_version', APP_VERSION);
      }
    };
    checkIfShouldShowModal();
  }, []);

  const showModal = () => setIsVisible(true);
  const hideModal = () => setIsVisible(false);

  return { isVisible, showModal, hideModal };
};

const lightStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  changelogText: {
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
const darkStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#282828',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  changelogText: {
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 20,
    color: 'white',
  },
  button: {
    backgroundColor: '#1E40AF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ChangelogModal;