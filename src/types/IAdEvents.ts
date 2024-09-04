import type { TAdError } from './Types';

export interface IAdEvents {
  onAdLoaded?(): void;
  onAdFailedToLoad?(error: TAdError): void;
  onAdClicked?(): void;
  onAdOpened?(): void;
  onAdClosed?(): void;
}
