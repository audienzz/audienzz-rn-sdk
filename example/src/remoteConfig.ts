// Keep the endpoint, publisher and placements together: IDs belong to one environment.
// Android SDK 0.3.0 fetches remote config from production only. Publisher 81 and placements
// 118/192/267 exist on development and cannot be used with that released Android SDK.
export const REMOTE_CONFIG = {
  url: 'https://api.adnz.co/api/ws-sdk-config/public/v1/',
  publisherId: '35',
  fixedBannerId: '46',
  adaptiveBannerId: '48',
  interstitialId: '47',
} as const;
