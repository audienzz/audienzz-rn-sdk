export const getRandomConfigIdBanner = () => {
  const randomNumber = Math.random();
  return randomNumber < 0.5
    ? 'prebid-demo-banner-300-250'
    : 'prebid-demo-video-outstream-original-api';
};

export const getRandomConfigIdInterstitial = () => {
  const randomNumber = Math.random();
  return randomNumber < 0.5
    ? '34400101'
    : '34400101';
};
