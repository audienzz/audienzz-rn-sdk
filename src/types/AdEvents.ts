import type { AdError, AdSize } from './Types';

export interface AdEvents {
  onAdLoaded?(adSize: AdSize): void;
  onAdFailedToLoad?(error: AdError): void;
  onAdClicked?(): void;
  onAdOpened?(): void;
  onAdClosed?(): void;
}
