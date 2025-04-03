import React, { useState } from 'react';
import { Platform, View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useTheme } from './ThemeContext';
import env from "./env.js";

const IOS_ADUNITID = env.IOS_ADUNITID;
const ANDROID_ADUNITID = env.ANDROID_ADUNITID;

const adUnitId = Platform.select({
  ios: IOS_ADUNITID,
  android: ANDROID_ADUNITID,
}) || TestIds.BANNER;

const AdBanner: React.FC = () => {
  const [adLoaded, setAdLoaded] = useState(false);
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const styles = theme === 'light' ? lightStyles(isTablet) : darkStyles(isTablet);

  return (
    <View style={styles.container}>
      {!adLoaded && (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Śpiewnik+Religijny</Text>
        </View>
      )}
      
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => setAdLoaded(true)}
        onAdFailedToLoad={() => setAdLoaded(false)}
      />
    </View>
  );
};

const lightStyles = (isTablet: boolean) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center', 
    marginVertical: 10,
    marginTop: -3,
    minHeight: isTablet ? 80 : 50,
  },
  placeholderContainer: {
    position: 'absolute',
    paddingVertical: isTablet ? 12 : 8,
    paddingHorizontal: isTablet ? 24 : 16,
    borderWidth: isTablet? 3:2,
    borderColor: '#000',
    borderRadius: 12, 
    backgroundColor: '#fff',
  },
  placeholderText: {
    fontSize: isTablet ? 36 : 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
});

const darkStyles = (isTablet: boolean) => StyleSheet.create({
  ...lightStyles(isTablet),
  placeholderContainer: {
    ...lightStyles(isTablet).placeholderContainer,
    backgroundColor: '#121212',
    borderColor: '#BBBBBB',
  },
  placeholderText: {
    ...lightStyles(isTablet).placeholderText,
    color: '#FFFFFF',
  },
});

export default AdBanner;