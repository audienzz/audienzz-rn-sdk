const mockConfigure = jest.fn().mockResolvedValue(undefined);
jest.mock('../NativeRNAudienzzModule', () => ({
  __esModule: true,
  default: { AudienzzModule: { configureAnalytics: (...args: unknown[]) => mockConfigure(...args) } },
}));
jest.mock('../pageRegistry', () => ({}));
import { Audienzz } from '../RNAudienzz';

it('forwards analytics context and exposes native configuration failures', async () => {
  await Audienzz.configureAnalytics('35', 'test');
  expect(mockConfigure).toHaveBeenCalledWith('35', 'test');
  mockConfigure.mockRejectedValueOnce(new Error('INVALID_ENVIRONMENT'));
  await expect(Audienzz.configureAnalytics(null, 'staging')).rejects.toThrow('INVALID_ENVIRONMENT');
});
