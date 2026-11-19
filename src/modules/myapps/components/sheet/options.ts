import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

/** Options of the sheets, returned by the `options` of `defineModal`: a native form sheet as high as its content, with no header. */
export const sheetOptions = (): NativeStackNavigationOptions => ({
  headerShown: false,
  presentation: 'formSheet',
  sheetAllowedDetents: 'fitToContents',
  sheetGrabberVisible: true,
});
