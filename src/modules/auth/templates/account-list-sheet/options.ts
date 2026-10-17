import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

/**
 * Options of the screens that show the template as a modal: a native form sheet as high as its content, with no header.
 * To be returned by the `options` of `defineModal`.
 */
export const accountListSheetOptions = (): NativeStackNavigationOptions => ({
  headerShown: false,
  presentation: 'formSheet',
  sheetAllowedDetents: 'fitToContents',
  sheetGrabberVisible: true,
});
