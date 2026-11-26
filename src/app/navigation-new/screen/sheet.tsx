/**
 * Form sheets
 *
 * Tools for the screens presented as a native sheet (`presentation: 'formSheet'` or `'pageSheet'`): the content wrapper that fixes
 * the bottom spacing (`SheetView`), the maximum height of a `fitToContents` sheet, the shared paddings, and the grabber that Android
 * doesn't draw (mounted by `BaseStackScreenLayout`).
 */
import React from 'react';
import { Platform, StyleSheet, useWindowDimensions, View, type ViewProps, type ViewStyle } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackPresentationTypes } from 'react-native-screens';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

/** The presentations shown as a native sheet. */
export const sheetPresentations: (StackPresentationTypes | 'card')[] = ['formSheet', 'pageSheet'];

/**
 * On ios, formSheets have by default bottom spacing equals to the bottom inset that we need to remove.
 * On android, formSheets have by default NEGATIVE bottom spacing equals to the bottom inset that we need to nullish.
 * This fix compensates the default behaviour to let us manage our magins ourselves.
 * You NEED to use this style on every formSheet on a wrapper View, until this is fixed in react-native-screens.
 * Alternative : wrap you sheet content in a <SheetView> element.
 * No need to include ios/android logic, it is handled here.
 * @returns style to apply to the top-level view of a formSheet.
 */
export const useFormSheetStyleFix = (): ViewStyle => {
  const insets = useSafeAreaInsets();
  return React.useMemo(() => ({ flex: 1, marginBottom: Platform.OS === 'ios' ? -insets.bottom : insets.bottom }), [insets.bottom]);
};

/**
 * On ios, formSheets have by default bottom spacing equals to the bottom inset that we need to remove.
 * On android, formSheets have by default NEGATIVE bottom spacing equals to the bottom inset that we need to nullish.
 * This fix compensates the default behaviour to let us manage our magins ourselves.
 * You NEED to use this style on every formSheet on a wrapper View, until this is fixed in react-native-screens.
 * Alternative : useFormSheetStyleFix().
 * No need to include ios/android logic, it is handled here.
 * @returns a View element with botton sheet styles to put yout content into it.
 */
export const SheetView = ({ style: _style, ...props }: ViewProps) => {
  const sheetStyle = useFormSheetStyleFix();
  return <View style={React.useMemo(() => [sheetStyle, _style], [sheetStyle, _style])} {...props} />;
};

/**
 * The highest a `fitToContents` formSheet can show its content.
 *
 * With `sheetAllowedDetents: 'fitToContents'`, the sheet is as high as its content, up to the height of the screen. Past it, the native
 * sheet stops growing but its content does not: the bottom is cut and a list in it does not scroll. Give this height as `maxHeight` to
 * the content (the `SheetView`) that can be longer than the screen: it is then as high as it needs, and scrolls past this height.
 *
 * The native sheet doesn't give its maximum height to JS: this one is the window less the safe areas and a margin, a little lower
 * than the real maximum on both platforms.
 */
export const useSheetMaxHeight = (): number => {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return height - insets.top - insets.bottom - UI_SIZES.spacing.big;
};

/**
 * Default spacing helpers to have a single source of truth for bottom sheet paddings.
 */
const sheetStylePadding = UI_SIZES.spacing.big;
export const sheetSpacingStyles = StyleSheet.create({
  padding: { padding: sheetStylePadding },
  paddingBottom: { paddingBottom: sheetStylePadding },
  paddingHorizontal: { paddingHorizontal: sheetStylePadding },
  paddingLeft: { paddingLeft: sheetStylePadding },
  paddingRight: { paddingRight: sheetStylePadding },
  paddingTop: { paddingTop: sheetStylePadding },
  paddingVertical: { paddingVertical: sheetStylePadding },
});

const sheetStylesInternal = StyleSheet.create({
  grabberAndroid: {
    alignSelf: 'center',
    backgroundColor: theme.palette.grey.grey,
    borderRadius: getScaleWidth(2),
    height: getScaleWidth(4),
    position: 'absolute',
    top: getScaleWidth(6),
    width: getScaleWidth(48),
  },
});

/** Native Android formSheets have no grabber: `BaseStackScreenLayout` draws this one when `sheetGrabberVisible` is set. */
export function AndroidSheetGrabber() {
  return <View style={sheetStylesInternal.grabberAndroid} />;
}
