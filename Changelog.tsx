import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from './ThemeContext';

const ChangelogModal = ({ isVisible, onClose }: { isVisible: boolean, onClose: () => void }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { theme } = useTheme();
  const styles = theme === 'light' ? lightStyles(isTablet) : darkStyles(isTablet);
  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Najnowsze zmiany</Text>
          <Text style={styles.changelogText}>
            - Zmiany wizualne{'\n'}
            - Przebudowana karta 'Piosenka'{'\n'}
            - Dodano nowe piosenki - Zaktualizuj listę w ustawieniach
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

  const showModal = () => setIsVisible(true);
  const hideModal = () => setIsVisible(false);

  return { isVisible, showModal, hideModal };
};

const lightStyles = (isTablet: boolean) => StyleSheet.create({
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
    fontSize: isTablet ? 26:20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  changelogText: {
    fontSize: isTablet ? 22:16,
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
    fontSize: isTablet? 22:16,
  },
});
const darkStyles = (isTablet: boolean) => StyleSheet.create({
  ...lightStyles(isTablet),
  modalContainer: {
    ...lightStyles(isTablet).modalContainer,
    backgroundColor: '#282828',
  },
  title: {
    ...lightStyles(isTablet).title,
    color: 'white',
  },
  changelogText: {
    ...lightStyles(isTablet).changelogText,
    color: 'white',
  },
  button: {
    ...lightStyles(isTablet).button,
    backgroundColor: '#1E40AF',
  },
  buttonText: {
    ...lightStyles(isTablet).buttonText,
    color: '#fff',
  },
});

export default ChangelogModal;