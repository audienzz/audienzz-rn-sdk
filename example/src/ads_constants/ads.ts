import { Platform, Dimensions } from 'react-native';

export const ADS = {
  REWARDED: {
    adUnitId: '/21808260008/prebid-demo-app-original-api-video-interstitial',
    auConfigId: 'prebid-demo-video-rewarded-320-480',
  },
  PRELOADING: {
    adUnitId: "/96628199/testapp_publisher/banner_test_ad_unit",
    auConfigId: "15624474",
  },
  BANNER_RESERVED_DEMO: {
    adUnitId: '/21808260008/prebid_demo_app_original_api_banner',
    auConfigId: 'prebid-demo-banner-320-50',
    sizes: [{ width: 320, height: 50 }],
  },
  INTERSTITIAL_DEMO: {
    adUnitId: "/21808260008/prebid-demo-app-original-api-display-interstitial",
    auConfigId: "prebid-demo-display-interstitial-320-480",
  },
  REWARDED_DEMO: {
    adUnitId: "ca-app-pub-3940256099942544/171248531",
    auConfigId: "prebid-demo-video-rewarded-320-480-original-api",
  },
  REWARDED_ORIGINAL_API: {
    adUnitId: 'ca-app-pub-3940256099942544/1712485313',
    auConfigId: 'prebid-demo-video-rewarded-320-480-original-api',
  },
  RENDERING_BANNER_RESERVED: {
    adUnitId:
      Platform.OS === 'android'
        ? 'ca-app-pub-3940256099942544/2934735716'
        : '/21808260008/prebid_oxb_320x50_banner',
    auConfigId: 'prebid-demo-banner-320-50',
    width: 300,
    height: 250,
  },
  RENDERING_BANNER_VIDEO: {
    adUnitId: '/21808260008/prebid_oxb_300x250_banner',
    auConfigId: 'prebid-demo-video-outstream',
    width: 300,
    height: 250,
  },
  RENDERING_INTERSTITIAL_BANNER: {
    adUnitId: "/21808260008/prebid_oxb_html_interstitial",
    auConfigId: "prebid-demo-display-interstitial-320-480",
  },
  RENDERING_INTERSTITIAL_VIDEO: {
    adUnitId: "/21808260008/prebid_oxb_interstitial_video",
    auConfigId: "prebid-demo-video-interstitial-320-480",
  },
  ORIGINAL_BANNER_HTML_300_250: {
    adUnitId: "/96628199/de_audienzz.ch_v2/de_audienzz.ch_320_adnz_wideboard_1",
    auConfigId: "33994718",
    sizes: [{width: 300, height: 250}, {width: 220, height: 80}],
  },
  ORIGINAL_BANNER_HTML_320_50: {
    adUnitId: "ca-app-pub-3940256099942544/2934735716",
    auConfigId: "prebid-demo-banner-320-50",
    sizes: [{width: 320, height: 50}],
  },
  ORIGINAL_BANNER_VIDEO_300_250: {
    adUnitId: "/21808260008/prebid-demo-original-api-video-banner",
    auConfigId: "prebid-demo-video-outstream-original-api",
    sizes: [{width: 300, height: 250}],
  },
  ORIGINAL_BANNER_MULTISIZE: {
    adUnitId: "ca-app-pub-3940256099942544/2435281174",
    auConfigId: "prebid-demo-banner-320-50",
    sizes: [{width: Dimensions.get('window').width, height: 250}],
  },
  ORIGINAL_BANNER_MULTIFORMAT: {
    adUnitId: "/21808260008/prebid-demo-original-banner-multiformat",
    sizes: [{width: 300, height: 250}],
  },
};