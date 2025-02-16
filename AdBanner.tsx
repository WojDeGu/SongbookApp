import React from 'react';
import { Platform } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import Config from 'react-native-config';

const IOS_ADUNITID = Config.IOS_ADUNITID as string;
const ANDROID_ADUNITID = Config.ANDROID_ADUNITID as string;

const adUnitId = Platform.select({
    ios: IOS_ADUNITID,
    android: ANDROID_ADUNITID,
  }) || TestIds.BANNER;

const AdBanner: React.FC = () => {
  return (
    <View style={styles.container}>
      <BannerAd 
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
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
