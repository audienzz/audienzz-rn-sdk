import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { Audienzz } from '../RNAudienzz';

export interface AudienzzStickyAdWrapperProps {
  /** The ad component to wrap. */
  children: React.ReactNode;
  /**
   * Animated scroll Y value from the parent `ScrollView` or `FlatList`.
   *
   * ```tsx
   * const scrollY = useRef(new Animated.Value(0)).current;
   *
   * <ScrollView
   *   onScroll={Animated.event(
   *     [{ nativeEvent: { contentOffset: { y: scrollY } } }],
   *     { useNativeDriver: true }
   *   )}
   *   scrollEventThrottle={16}
   *   ...
   * />
   * ```
   */
  scrollY: Animated.Value;
  /**
   * Height reserved in the layout in points.
   *
   * Leave `undefined` to use the backend-configured value (requires `adConfigId`),
   * falling back to 600. A non-`undefined` value always wins over the backend setting.
   */
  maxHeight?: number;
  /**
   * Y offset (points) from the viewport top where the ad should stick.
   *
   * Leave `undefined` to use the backend-configured value (requires `adConfigId`),
   * falling back to 0. A non-`undefined` value always wins over the backend setting.
   */
  stickyTopOffset?: number;
  /** Whether sticky behaviour is enabled. Defaults to `true`. */
  enabled?: boolean;
  /**
   * Remote ad-unit config ID. When provided the SDK reads `stickyMaxHeight` and
   * `stickyTopOffset` from the cached remote config and uses them as fallback values.
   * Publisher-supplied `maxHeight` / `stickyTopOffset` always take precedence.
   */
  adConfigId?: string;
}

const DEFAULT_MAX_HEIGHT = 600;
const DEFAULT_STICKY_TOP_OFFSET = 0;

/**
 * Wraps an ad component and keeps it sticky within a reserved area as the user scrolls.
 *
 * Reserve `maxHeight` points in your layout. As the user scrolls past the wrapper,
 * the child ad slides within the reserved area, staying visible for as long as possible
 * before scrolling off screen.
 *
 * The sticky behaviour mirrors the iOS `AUStickyAdWrapperView` and Flutter
 * `AudienzzStickyAdWrapper` widget.
 *
 * @example
 * ```tsx
 * const scrollY = useRef(new Animated.Value(0)).current;
 *
 * <ScrollView
 *   onScroll={Animated.event(
 *     [{ nativeEvent: { contentOffset: { y: scrollY } } }],
 *     { useNativeDriver: true }
 *   )}
 *   scrollEventThrottle={16}
 * >
 *   // With backend-controlled dimensions:
 *   <AudienzzStickyAdWrapper scrollY={scrollY} adConfigId="118">
 *     <RemoteConfigBanner adConfigId="118" ... />
 *   </AudienzzStickyAdWrapper>
 *
 *   // With explicit override (ignores backend value):
 *   <AudienzzStickyAdWrapper scrollY={scrollY} maxHeight={450}>
 *     <OriginalBanner adUnitID="..." auConfigID="..." sizes={[...]} />
 *   </AudienzzStickyAdWrapper>
 * </ScrollView>
 * ```
 */
export function AudienzzStickyAdWrapper({
  children,
  scrollY,
  maxHeight,
  stickyTopOffset,
  enabled = true,
  adConfigId,
}: AudienzzStickyAdWrapperProps): React.JSX.Element {
  // Effective values: publisher override → remote config → SDK default.
  // Initialised to the publisher value or default; updated from remote config on mount.
  const [effectiveMaxHeight, setEffectiveMaxHeight] = useState(
    maxHeight ?? DEFAULT_MAX_HEIGHT,
  );
  const [effectiveStickyTopOffset, setEffectiveStickyTopOffset] = useState(
    stickyTopOffset ?? DEFAULT_STICKY_TOP_OFFSET,
  );

  // Fetch remote config values on mount when adConfigId is provided.
  // Publisher props (maxHeight / stickyTopOffset) always win — we only apply remote
  // values for props the publisher left undefined.
  useEffect(() => {
    if (!adConfigId) return;
    Audienzz.getStickyConfig(adConfigId)
      .then((config) => {
        if (maxHeight === undefined) {
          setEffectiveMaxHeight(config.maxHeight);
        }
        if (stickyTopOffset === undefined) {
          setEffectiveStickyTopOffset(config.stickyTopOffset);
        }
      })
      .catch(() => {
        // Remote config unavailable — keep current effective values (defaults or publisher overrides).
      });
  // adConfigId is intentionally the only dependency: we only re-fetch when it changes.
  // maxHeight / stickyTopOffset are read from the closure at the time the effect runs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adConfigId]);

  // Sync publisher prop changes into effective values immediately (publisher wins).
  useEffect(() => {
    if (maxHeight !== undefined) setEffectiveMaxHeight(maxHeight);
  }, [maxHeight]);

  useEffect(() => {
    if (stickyTopOffset !== undefined) setEffectiveStickyTopOffset(stickyTopOffset);
  }, [stickyTopOffset]);

  // Animated.Value instead of state: setValue() updates the value without
  // triggering a re-render or recreating the interpolation chain, so there
  // are no bridge roundtrips during scroll when the wrapper re-lays out.
  const wrapperYAnim = useRef(new Animated.Value(0)).current;

  // Measured height of the child ad content
  const [childHeight, setChildHeight] = useState(0);

  const effectiveChildHeight = childHeight > 0 ? childHeight : effectiveMaxHeight;
  const maxTop = Math.max(0, effectiveMaxHeight - effectiveChildHeight);

  // top = clamp(scrollY - (wrapperY - stickyTopOffset), 0, maxTop)
  // Use stateless interpolation instead of diffClamp to avoid fling catch-up
  // artifacts after finger release.
  // wrapperYAnim is a stable ref — its value changes but the chain is never
  // recreated during scroll, only once when childHeight first resolves.
  const animatedTop = useMemo(() => {
    if (!enabled) {
      return new Animated.Value(0);
    }
    if (maxTop <= 0) {
      return new Animated.Value(0);
    }
    const shifted = Animated.add(
      Animated.subtract(scrollY, wrapperYAnim),
      effectiveStickyTopOffset,
    );
    return shifted.interpolate({
      inputRange: [0, maxTop],
      outputRange: [0, maxTop],
      extrapolate: 'clamp',
    });
  }, [enabled, maxTop, scrollY, effectiveStickyTopOffset, wrapperYAnim]);

  const onWrapperLayout = useCallback(
    (e: LayoutChangeEvent) => {
      wrapperYAnim.setValue(e.nativeEvent.layout.y);
    },
    [wrapperYAnim],
  );

  const onChildLayout = useCallback((e: LayoutChangeEvent) => {
    setChildHeight(e.nativeEvent.layout.height);
  }, []);

  return (
    <View
      style={{ height: effectiveMaxHeight, overflow: 'hidden' }}
      onLayout={onWrapperLayout}
    >
      <Animated.View
        style={{ transform: [{ translateY: animatedTop }] }}
        onLayout={onChildLayout}
      >
        {children}
      </Animated.View>
    </View>
  );
}
