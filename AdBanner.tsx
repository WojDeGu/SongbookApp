import React from 'react';
import { Platform } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import env from "./env.js";

const IOS_ADUNITID = env.IOS_ADUNITID;
const ANDROID_ADUNITID = env.ANDROID_ADUNITID;

const adUnitId = Platform.select({
    ios: IOS_ADUNITID,
    android: ANDROID_ADUNITID,
  }) || TestIds.BANNER;

const AdBanner: React.FC = () => {
  return (
    <View style={styles.container}>
      <BannerAd 
        unitId={adUnitId} //{TestIds.BANNER} 
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
