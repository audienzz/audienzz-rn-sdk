import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Animated, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';

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
  /** Height reserved in the layout in points. Defaults to 600. */
  maxHeight?: number;
  /**
   * Y offset (points) from the viewport top where the ad should stick.
   * Defaults to 0.
   */
  stickyTopOffset?: number;
  /** Whether sticky behaviour is enabled. Defaults to `true`. */
  enabled?: boolean;
}

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
 *   <AudienzzStickyAdWrapper scrollY={scrollY} maxHeight={450}>
 *     <OriginalBanner
 *       adUnitID="..."
 *       auConfigID="..."
 *       sizes={[{ width: 300, height: 250 }]}
 *     />
 *   </AudienzzStickyAdWrapper>
 * </ScrollView>
 * ```
 */
export function AudienzzStickyAdWrapper({
  children,
  scrollY,
  maxHeight = 600,
  stickyTopOffset = 0,
  enabled = true,
}: AudienzzStickyAdWrapperProps): React.JSX.Element {
  // y offset of this wrapper within the scroll content (measured via onLayout)
  const [wrapperYInContent, setWrapperYInContent] = useState(0);

  // Measured height of the child ad content
  const [childHeight, setChildHeight] = useState(0);

  const effectiveChildHeight = childHeight > 0 ? childHeight : maxHeight;
  const maxTop = Math.max(0, maxHeight - effectiveChildHeight);

  // top = clamp(scrollY - (wrapperY - stickyTopOffset), 0, maxTop)
  // Use stateless interpolation instead of diffClamp to avoid fling catch-up
  // artifacts after finger release.
  const animatedTop = useMemo(() => {
    if (!enabled) {
      return new Animated.Value(0);
    }
    const shifted = Animated.subtract(
      scrollY,
      wrapperYInContent - stickyTopOffset,
    );
    if (maxTop <= 0) {
      return new Animated.Value(0);
    }
    return shifted.interpolate({
      inputRange: [0, maxTop],
      outputRange: [0, maxTop],
      extrapolate: 'clamp',
    });
  }, [enabled, maxTop, scrollY, stickyTopOffset, wrapperYInContent]);

  const onWrapperLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const y = e.nativeEvent.layout.y;
      setWrapperYInContent((prev) => (Math.abs(prev - y) > 0.5 ? y : prev));
    },
    [],
  );

  const onChildLayout = useCallback((e: LayoutChangeEvent) => {
    setChildHeight(e.nativeEvent.layout.height);
  }, []);

  return (
    <View
      style={{ height: maxHeight, overflow: 'hidden' }}
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
