import * as React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AudienzzBanner,
  AudienzzPage,
  audienzzOnNavigationStateChange,
  logAppAction,
  type AudienzzBannerHandle,
} from 'audienzz';
import { LOREM } from '../constants';

/**
 * Every managed flow the reviews asked about, in one screen, each reachable in two taps.
 *
 * It drives the SDK's navigation adapter from its own router — the same thing `App.tsx` does — so
 * the `route` prop on each `AudienzzPage` is meaningful and focus behaves exactly as it would
 * under React Navigation.
 *
 * Each action logs one `AUDZ app …` line, so a captured log reads back as a sequence without
 * anyone having to remember what they tapped.
 */

type Route =
  | { key: 'article-1'; name: 'article' }
  | { key: 'article-2'; name: 'article' }
  | { key: 'settings'; name: 'settings' };

const ROUTES: Record<Route['key'], Route> = {
  'article-1': { key: 'article-1', name: 'article' },
  'article-2': { key: 'article-2', name: 'article' },
  settings: { key: 'settings', name: 'settings' },
};

export default function ManagedFlowsExample({ onBack }: { onBack: () => void }) {
  const [route, setRoute] = React.useState<Route>(ROUTES['article-1']);
  // "Delayed content": the article's body (and its ad slots) arrive after the route does, which is
  // what a real article screen does while it fetches. The interesting case is navigating away
  // BEFORE it lands — the late content must not reclaim the foreground.
  const [contentReady, setContentReady] = React.useState(true);

  const go = React.useCallback((next: Route) => {
    logAppAction('navigate', { to: next.key, name: next.name });
    // A custom router reports focus the same way React Navigation's adapter does.
    audienzzOnNavigationStateChange({
      index: 0,
      routes: [{ key: next.key, name: next.name }],
    });
    setRoute(next);
  }, []);

  const startDelayedArticle = React.useCallback(() => {
    logAppAction('delayedContent.start', { seconds: 3 });
    setContentReady(false);
    go(ROUTES['article-1']);
    setTimeout(() => {
      logAppAction('delayedContent.arrived');
      setContentReady(true);
    }, 3000);
  }, [go]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bar}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.link}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.current}>on: {route.key}</Text>
      </View>

      <View style={styles.nav}>
        <Nav label="Article 1" onPress={() => go(ROUTES['article-1'])} />
        <Nav label="Article 2" onPress={() => go(ROUTES['article-2'])} />
        <Nav label="Settings (ad-free)" onPress={() => go(ROUTES.settings)} />
      </View>
      <View style={styles.nav}>
        <Nav label="Article after 3s delay" onPress={startDelayedArticle} />
      </View>

      {route.key === 'settings' ? (
        // An ad-free destination is a screen too. Reporting it is what releases the previous
        // page's banners — the whole point of the A → B → A flow.
        <AudienzzPage name="settings" route={{ key: 'settings' }}>
          <View style={styles.adFree}>
            <Text style={styles.body}>
              No ads on this screen. Going back to an article should release these banners and
              recreate them for the new visit — watch for `slot release` then `slot recreate`.
            </Text>
          </View>
        </AudienzzPage>
      ) : (
        // Two routes, both named "article". They must own their banners separately: reporting
        // article-2 must not refresh article-1's slots.
        <AudienzzPage key={route.key} name="article" route={{ key: route.key }}>
          {contentReady ? (
            <Article routeKey={route.key} />
          ) : (
            <View style={styles.adFree}>
              <Text style={styles.body}>
                Loading article… Navigate away now: when the content lands it must NOT reclaim the
                foreground or create an ad.
              </Text>
            </View>
          )}
        </AudienzzPage>
      )}
    </SafeAreaView>
  );
}

/** A scrolling article with two in-content slots and an explicit host-reported cover. */
function Article({ routeKey }: { routeKey: string }) {
  const top = React.useRef<AudienzzBannerHandle>(null);
  const [covered, setCovered] = React.useState(false);
  const [paused, setPaused] = React.useState(false);

  const toggleCover = () => {
    const next = !covered;
    logAppAction('cover', { slot: 'in-content-1', covered: next });
    // Geometry and hit testing cannot see a pointer-transparent veil, so the host reports it.
    top.current?.reportCover(next);
    setCovered(next);
  };

  const togglePause = () => {
    const next = !paused;
    logAppAction('publisherPause', { slot: 'in-content-1', paused: next });
    if (next) top.current?.stopAutoRefresh();
    else top.current?.resumeAutoRefresh();
    setPaused(next);
  };

  return (
    <ScrollView style={styles.scroll}>
      <View style={styles.controls}>
        <Nav label={covered ? 'Remove cover' : 'Report cover'} onPress={toggleCover} />
        <Nav label={paused ? 'Resume refresh' : 'Pause refresh'} onPress={togglePause} />
      </View>

      <AudienzzBanner
        ref={top}
        adConfigId="118"
        slotKey="in-content-1"
        placeholderHeight={250}
      />
      {covered && (
        // A painted veil over the slot: visible to the reader, invisible to any geometry check.
        <View style={styles.veil} pointerEvents="none">
          <Text style={styles.veilText}>covered by the host</Text>
        </View>
      )}

      <Text style={styles.body}>{LOREM}</Text>
      <Text style={styles.body}>{LOREM}</Text>

      {/* Far enough down that reaching it is a real scroll — this is the offscreen-return case. */}
      <AudienzzBanner
        adConfigId="118"
        slotKey="in-content-2"
        placeholderHeight={250}
      />
      <Text style={styles.body}>{LOREM}</Text>
      <Text style={styles.footer}>end of {routeKey}</Text>
    </ScrollView>
  );
}

function Nav({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  link: { fontSize: 16, color: '#1565C0', fontWeight: '600' },
  current: { fontSize: 13, color: '#555' },
  nav: { flexDirection: 'row', paddingHorizontal: 8, paddingTop: 8 },
  controls: { flexDirection: 'row', paddingHorizontal: 8, paddingBottom: 8 },
  button: {
    flex: 1,
    margin: 4,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1565C0',
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 13 },
  scroll: { flex: 1 },
  adFree: { padding: 24 },
  body: { padding: 16, fontSize: 15, lineHeight: 22, color: '#222' },
  footer: { padding: 16, fontSize: 13, color: '#888', textAlign: 'center' },
  veil: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  veilText: { color: 'white', fontWeight: '700' },
});
