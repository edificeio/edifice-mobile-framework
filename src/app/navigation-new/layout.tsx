/**
 * Wrapper screens
 */

import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View, ViewStyle } from 'react-native';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NativeStackNavigatorProps } from '@react-navigation/native-stack';
import ErrorBoundary from 'react-native-error-boundary';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackPresentationTypes } from 'react-native-screens';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import ErrorScreenView from '~/framework/components/screen/error';
import { ToastContainer } from '~/framework/components/toast';

const modalPresentations: (StackPresentationTypes | 'card')[] = [
  'containedModal',
  'containedTransparentModal',
  'formSheet',
  'fullScreenModal',
  'modal',
  'pageSheet',
  'transparentModal',
];

const sheetPresentations: (StackPresentationTypes | 'card')[] = ['formSheet', 'pageSheet'];

const IsModalContext = React.createContext(false);

/**
 * Tells whether the screen is presented as a modal (`modal`, `formSheet`, `pageSheet`...) or as a card.
 * A screen of a navigator nested in a modal (e.g. the sign-in screens in the add-account modal) is in a modal too.
 * Use it to adjust insets and margins: a modal has no status bar nor home indicator zone under it, a card does.
 *
 * The presentation is a screen option, and options are not reachable from the screens (`useNavigation` can only set them):
 * `BaseStackScreenLayout` gives them through this context.
 */
export const useIsModal = () => React.useContext(IsModalContext);

/**
 * Provides `useIsModal` to the screen it wraps. Used by `BaseStackScreenLayout`.
 * It is a component (not a hook) because the screen layout is called as a function by the navigator, hooks can't be used there.
 */
export function IsModalProvider({ children, presentedAsModal }: React.PropsWithChildren<{ presentedAsModal: boolean }>) {
  const insideModal = useIsModal();
  return <IsModalContext.Provider value={presentedAsModal || insideModal}>{children}</IsModalContext.Provider>;
}

export function BaseStackScreenLayout({
  children,
  options,
}: Parameters<NonNullable<NativeStackNavigatorProps['screenLayout']>>[0]) {
  // ToDo: Track error
  const isModal = options.presentation && modalPresentations.includes(options.presentation);
  const Wrapper = isModal ? BottomSheetModalProvider : React.Fragment;

  const isFormSheet = options.presentation && sheetPresentations.includes(options.presentation);

  return (
    <Wrapper>
      {
        /* Native Android formSheets does not have a grabber so were have to do it ourselves. */
        isFormSheet && Platform.OS === 'android' && options.sheetGrabberVisible && <AndroidSheetGrabber />
      }
      <IsModalProvider presentedAsModal={!!isModal}>
        <ErrorBoundary FallbackComponent={ErrorScreenView}>
          <React.Suspense fallback={<ActivityIndicator color={theme.palette.primary.regular} />}>{children}</React.Suspense>
        </ErrorBoundary>
      </IsModalProvider>
      {isModal && <ToastContainer />}
    </Wrapper>
  );
}

/**
 * On ios, formSheets have by default bottom spacing equals to the bottom inset that we need to remove.
 * On android, formSheets have by default NEGATIVE bottom spacing equals to the bottom inset that we need to nullish.
 * This fix compensates the default behaviour to let us manage our magins ourselves.
 * You NEED to use this style on every formSheet on a wrapper View, until this is fixed in react-native-screens.
 * No need to include ios/android logic, it is handled here.
 * @returns style to apply to the top-level view of a formSheet.
 */
export const useFormSheetStyleFix = (): ViewStyle => {
  const insets = useSafeAreaInsets();
  return React.useMemo(() => ({ flex: 1, marginBottom: Platform.OS === 'ios' ? -insets.bottom : insets.bottom }), [insets.bottom]);
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
function AndroidSheetGrabber() {
  return <View style={sheetStylesInternal.grabberAndroid} />;
}
