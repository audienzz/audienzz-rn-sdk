// M10: first real tests replacing the `it.todo` placeholder. These cover the deterministic,
// dependency-free surface (ad-size constants and remote-config defaults). Component prop-remap
// (camelCase -> SCREAMING_CASE) snapshot tests are the recommended next addition once the jest
// RN preset is wired up in CI.
import { AdSizes } from '../constants/AdSizes';
import {
  DEFAULT_REFRESH_TIME_SECONDS,
  DEFAULT_PREFETCH_DISTANCE_DP,
} from '../types/RemoteConfigTypes';

describe('AdSizes', () => {
  it('exposes the standard IAB ad dimensions', () => {
    expect(AdSizes.BANNER).toEqual({ width: 320, height: 50 });
    expect(AdSizes.MEDIUM_RECTANGLE).toEqual({ width: 300, height: 250 });
    expect(AdSizes.LEADERBOARD).toEqual({ width: 728, height: 90 });
    expect(AdSizes.LARGE_BANNER).toEqual({ width: 320, height: 100 });
  });

  it('reports positive integer dimensions for every named size', () => {
    for (const size of Object.values(AdSizes)) {
      expect(Number.isInteger(size.width)).toBe(true);
      expect(Number.isInteger(size.height)).toBe(true);
      expect(size.width).toBeGreaterThan(0);
      expect(size.height).toBeGreaterThan(0);
    }
  });
});

describe('remote config defaults', () => {
  it('defaults refresh time to 30 seconds', () => {
    expect(DEFAULT_REFRESH_TIME_SECONDS).toBe(30);
  });

  it('defaults prefetch distance to 200 dp', () => {
    expect(DEFAULT_PREFETCH_DISTANCE_DP).toBe(200);
  });
});
