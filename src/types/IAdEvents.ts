import type { TAdError, TAdSize } from './Types';

export interface IAdEvents {
  onAdLoaded?(adSize: TAdSize): void;
  onAdFailedToLoad?(error: TAdError): void;
  onAdClicked?(): void;
  onAdOpened?(): void;
  onAdClosed?(): void;
}
