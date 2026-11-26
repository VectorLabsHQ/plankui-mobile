'use no memo'; // Animated values are mutated outside render; React Compiler memoisation freezes them.
import { isValidElement, useRef, type ReactNode } from 'react';
import { Animated, KeyboardAvoidingView, Platform, RefreshControl, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ND, useTheme } from '../theme';
import { BigTitle, hasBigTitle, ScrollY, type NavBarProps } from './NavBar';
import { SearchField } from './SearchField';

export type ScreenProps = {
  children: ReactNode;
  /** A <NavBar>. It handles the top safe area; without one the screen does. */
  header?: ReactNode;
  /** Pinned below the content, e.g. a <TabBar> or a bottom action. Handles the bottom safe area. */
  footer?: ReactNode;
  /** false for screens that manage their own list (FlatList etc). */
  scroll?: boolean;
  /** Grey grouped background on iOS, for screens built from <ListSection>s. */
  grouped?: boolean;
  /** Turns on pull-to-refresh. */
  onRefresh?: () => void;
  refreshing?: boolean;
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * The page frame: safe areas, keyboard avoidance (inputs never hide behind the keyboard),
 * taps that work while the keyboard is open, pull-to-refresh, and the scroll position the
 * <NavBar> uses to collapse its large title or fill in over a cover.
 */
export function Screen({ children, header, footer, scroll = true, grouped, onRefresh, refreshing = false, padded = true, contentStyle }: ScreenProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(0)).current;
  const bar = isValidElement<NavBarProps>(header) ? header.props : null;
  const overlay = bar?.variant === 'transparent';
  const big = hasBigTitle(bar?.variant);
  // A floating <TabBar> sits over the content, so the content scrolls under it and ends clear of it.
  const floating = isValidElement<{ floating?: boolean }>(footer) && !!footer.props.floating;
  const bg = grouped && t.os === 'ios' ? t.c.grouped : t.c.bg; // Material lists sit on the plain surface
  const pad = [{ padding: padded ? 16 : 0, paddingTop: big ? 0 : padded ? 16 : 0, paddingBottom: (footer && !floating ? 0 : insets.bottom) + (padded ? 24 : 0) + (floating ? 88 : 0), gap: 16 }, contentStyle];
  const inset = padded ? null : { paddingHorizontal: 16 };

  const top = (
    <>
      {big && bar ? (
        <View style={inset}>
          <BigTitle title={bar.title} subtitle={bar.subtitle} variant={bar.variant} />
        </View>
      ) : null}
      {bar?.variant === 'search' && bar.search ? (
        <View style={inset}>
          <SearchField value={bar.search.value} onChangeText={bar.search.onChangeText} placeholder={bar.search.placeholder} />
        </View>
      ) : null}
    </>
  );

  return (
    <ScrollY.Provider value={y}>
      <View style={{ flex: 1, backgroundColor: bg, paddingTop: header ? 0 : insets.top }}>
        {header && !overlay ? header : null}
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {scroll ? (
            <Animated.ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={pad}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { y } } }], { useNativeDriver: ND })}
              scrollEventThrottle={16}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              contentInsetAdjustmentBehavior="never"
              refreshControl={
                onRefresh ? (
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.c.muted} colors={[t.c.accent]} progressBackgroundColor={t.c.surface} />
                ) : undefined
              }
            >
              {top}
              {children}
            </Animated.ScrollView>
          ) : (
            <View style={[{ flex: 1 }, pad]}>
              {top}
              {children}
            </View>
          )}
          {floating ? <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>{footer}</View> : footer}
        </KeyboardAvoidingView>
        {/* a transparent bar floats over the content (cover images run under it) */}
        {overlay ? <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>{header}</View> : null}
      </View>
    </ScrollY.Provider>
  );
}
