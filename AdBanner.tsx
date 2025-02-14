import React from 'react';
import { Platform } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = Platform.select({
    ios: 'ca-app-pub-3054958321666076/5075788191', // Wstaw ID reklamy dla iOS
    android: 'ca-app-pub-3054958321666076/6616100577', // Wstaw ID reklamy dla Androida
  }) || TestIds.BANNER;

const AdBanner: React.FC = () => {
  return (
    <View style={styles.container}>
      <BannerAd 
        unitId={TestIds.BANNER}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
});

export default AdBanner;
