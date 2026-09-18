import {
  audienzzOnNavigationStateChange,
  resetAudienzzNavigationTracking,
} from '../managed/navigation';
import { Audienzz } from '../RNAudienzz';

jest.mock('react-native', () => ({
  Platform: { select: (o: any) => o.default },
  NativeModules: {},
  DeviceEventEmitter: { addListener: jest.fn() },
}));

describe('React Navigation adapter', () => {
  let activated: Array<{ id: string; name: string }>;

  beforeEach(() => {
    resetAudienzzNavigationTracking();
    activated = [];
    jest
      .spyOn(Audienzz, 'activatePage')
      .mockImplementation((p) => activated.push({ id: p.id, name: p.name }));
  });
  afterEach(() => jest.restoreAllMocks());

  const stack = (...routes: Array<{ key: string; name: string }>) => ({
    index: routes.length - 1,
    routes,
  });

  it('reports the focused route, identified by its screen name', () => {
    // The name is the identity by default, so this adapter, AudienzzPage and the legacy
    // pageImpression(name) all agree about which page a banner is on.
    audienzzOnNavigationStateChange(stack({ key: 'Article-a', name: 'Article' }));
    expect(activated).toEqual([{ id: 'Article', name: 'Article' }]);
  });

  it('separates two article routes only when per-instance identity is opted into', () => {
    audienzzOnNavigationStateChange(stack({ key: 'Article-a', name: 'Article' }));
    audienzzOnNavigationStateChange(
      stack({ key: 'Article-a', name: 'Article' }, { key: 'Article-b', name: 'Article' })
    );
    expect(activated.map((p) => p.id)).toEqual(['Article', 'Article']);

    activated.length = 0;
    resetAudienzzNavigationTracking();
    audienzzOnNavigationStateChange(stack({ key: 'Article-a', name: 'Article' }), {
      perInstance: true,
    });
    audienzzOnNavigationStateChange(
      stack({ key: 'Article-a', name: 'Article' }, { key: 'Article-b', name: 'Article' }),
      { perInstance: true }
    );
    expect(activated.map((p) => p.id)).toEqual(['Article-a', 'Article-b']);
    expect(activated.map((p) => p.name)).toEqual(['Article', 'Article']);
  });

  it('reports a destination that carries no ads, so the previous page is released', () => {
    audienzzOnNavigationStateChange(stack({ key: 'Article-a', name: 'Article' }));
    audienzzOnNavigationStateChange(
      stack({ key: 'Article-a', name: 'Article' }, { key: 'Settings-x', name: 'Settings' })
    );
    expect(activated).toHaveLength(2);
    expect(activated[1]).toEqual({ id: 'Settings', name: 'Settings' });
  });

  it('deduplicates repeated callbacks for the same focused route', () => {
    const state = stack({ key: 'Article-a', name: 'Article' });
    audienzzOnNavigationStateChange(state);
    audienzzOnNavigationStateChange(state);
    audienzzOnNavigationStateChange(state);
    expect(activated).toHaveLength(1);
  });

  it('reports a return to a previous route', () => {
    audienzzOnNavigationStateChange(stack({ key: 'Home-h', name: 'Home' }));
    audienzzOnNavigationStateChange(
      stack({ key: 'Home-h', name: 'Home' }, { key: 'Article-a', name: 'Article' })
    );
    audienzzOnNavigationStateChange(stack({ key: 'Home-h', name: 'Home' }));
    expect(activated.map((p) => p.id)).toEqual(['Home', 'Article', 'Home']);
  });

  it('reports the deepest focused route in a nested navigator', () => {
    audienzzOnNavigationStateChange({
      index: 0,
      routes: [
        {
          key: 'Tabs-t',
          name: 'Tabs',
          state: {
            index: 1,
            routes: [
              { key: 'Feed-f', name: 'Feed' },
              { key: 'Saved-s', name: 'Saved' },
            ],
          },
        },
      ],
    });
    expect(activated).toEqual([{ id: 'Saved', name: 'Saved' }]);
  });

  it('does not suppress an explicit report by the app', () => {
    // The adapter deduplicates only its OWN callbacks; app code stays in control.
    audienzzOnNavigationStateChange(stack({ key: 'Article-a', name: 'Article' }));
    Audienzz.activatePage({ id: 'Dialog-1', name: 'Paywall' });
    audienzzOnNavigationStateChange(stack({ key: 'Article-a', name: 'Article' }));
    expect(activated.map((p) => p.id)).toEqual(['Article', 'Dialog-1']);
  });

  it('ignores an empty or undefined state', () => {
    audienzzOnNavigationStateChange(undefined);
    audienzzOnNavigationStateChange({ index: 0, routes: [] });
    expect(activated).toHaveLength(0);
  });
});
