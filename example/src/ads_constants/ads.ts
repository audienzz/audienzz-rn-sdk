import { Platform, Dimensions } from 'react-native';

export const ADS = {
  REWARDED: {
    adUnitID: '/21808260008/prebid-demo-app-original-api-video-interstitial',
    auConfigID: 'prebid-demo-video-rewarded-320-480',
  },
  PRELOADING: {
    adUnitID: "/96628199/testapp_publisher/banner_test_ad_unit",
    auConfigID: "15624474",
  },
  BANNER_RESERVED_DEMO: {
    adUnitID: '/21808260008/prebid_demo_app_original_api_banner',
    auConfigID: 'prebid-demo-banner-320-50',
    sizes: [{ width: 320, height: 50 }],
  },
  INTERSTITIAL_DEMO: {
    adUnitID: "/21808260008/prebid-demo-app-original-api-display-interstitial",
    auConfigID: "prebid-demo-display-interstitial-320-480",
  },
  REWARDED_DEMO: {
    adUnitID: "ca-app-pub-3940256099942544/171248531",
    auConfigID: "prebid-demo-video-rewarded-320-480-original-api",
  },
  REWARDED_ORIGINAL_API: {
    adUnitID: 'ca-app-pub-3940256099942544/1712485313',
    auConfigID: 'prebid-demo-video-rewarded-320-480-original-api',
  },
  RENDERING_BANNER_RESERVED: {
    adUnitID:
      Platform.OS === 'android'
        ? 'ca-app-pub-3940256099942544/2934735716'
        : '/21808260008/prebid_oxb_320x50_banner',
    auConfigID: 'prebid-demo-banner-320-50',
    width: 300,
    height: 250,
  },
  RENDERING_BANNER_VIDEO: {
    adUnitID: '/21808260008/prebid_oxb_300x250_banner',
    auConfigID: 'prebid-demo-video-outstream',
    width: 300,
    height: 250,
  },
  RENDERING_INTERSTITIAL_BANNER: {
    adUnitID: "/21808260008/prebid_oxb_html_interstitial",
    auConfigID: "prebid-demo-display-interstitial-320-480",
  },
  RENDERING_INTERSTITIAL_VIDEO: {
    adUnitID: "/21808260008/prebid_oxb_interstitial_video",
    auConfigID: "prebid-demo-video-interstitial-320-480",
  },
  ORIGINAL_BANNER_HTML_300_250: {
    adUnitID: "/96628199/de_audienzz.ch_v2/de_audienzz.ch_320_adnz_wideboard_1",
    auConfigID: "33994718",
    sizes: [{width: 300, height: 250}, {width: 220, height: 80}],
  },
  ORIGINAL_BANNER_HTML_320_50: {
    adUnitID: "ca-app-pub-3940256099942544/2934735716",
    auConfigID: "prebid-demo-banner-320-50",
    sizes: [{width: 320, height: 50}],
  },
  ORIGINAL_BANNER_VIDEO_300_250: {
    adUnitID: "/21808260008/prebid-demo-original-api-video-banner",
    auConfigID: "prebid-demo-video-outstream-original-api",
    sizes: [{width: 300, height: 250}],
  },
  ORIGINAL_BANNER_MULTISIZE: {
    adUnitID: "ca-app-pub-3940256099942544/2435281174",
    auConfigID: "prebid-demo-banner-320-50",
    sizes: [{width: Dimensions.get('window').width, height: 250}],
  },
  ORIGINAL_BANNER_MULTIFORMAT: {
    adUnitID: "/21808260008/prebid-demo-original-banner-multiformat",
    sizes: [{width: 300, height: 250}],
  },
};