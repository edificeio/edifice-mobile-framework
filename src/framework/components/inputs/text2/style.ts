import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';

// export const defaultTextInputStyle: BaseTextInputStyle = {
//   ...TextSizeStyle.Small,
//   ...TextFontStyle.Regular,
//   flex: 0,
//   paddingHorizontal: UI_SIZES.spacing.small,
//   verticalAlign: 'top',
// };

/**
 * Common styles for text inputs/areas
 */
export default StyleSheet.create({
  deco: {
    height: UI_SIZES.spacing.minor,
    left: 0,
    pointerEvents: 'none',
    position: 'absolute',
    right: 10,
  },
  decoBottom: { bottom: 0 },
  decoTop: {
    top: 0,
  },
  input: {
    ...TextSizeStyle.Small,
    ...TextFontStyle.Regular,
    flex: 0,
    paddingHorizontal: UI_SIZES.spacing.small,
    verticalAlign: 'top',
  },
  placeholder: {
    ...TextSizeStyle.Small,
    ...TextFontStyle.Italic,
    color: theme.palette.grey.graphite,
    left: 0,
    paddingHorizontal: UI_SIZES.spacing.small,
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    top: 0,
    verticalAlign: 'middle',
  },
  wrapper: {
    alignItems: 'stretch',
    backgroundColor: undefined,
    borderWidth: 0,
    flexDirection: 'column',
    overflow: 'hidden',
  },
});

/**
 * Styles exclusive to ChatTextInput
 */
export const chat = StyleSheet.create({
  counter: {
    ...TextSizeStyle.Small,
    ...TextFontStyle.Italic,
    borderRadius: UI_SIZES.radius.small,
    color: theme.palette.grey.graphite,
    paddingHorizontal: UI_SIZES.spacing.small,
    pointerEvents: 'none',
    textAlign: 'right',
    verticalAlign: 'bottom',
  },
  counterMax: {
    color: theme.palette.status.failure.regular,
  },
  input: {
    ...TextSizeStyle.Small,
    ...TextFontStyle.Regular,
    paddingHorizontal: UI_SIZES.spacing.small,
  },
  wrapper: {
    backgroundColor: theme.palette.grey.fog,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.border.thin,
  },
});
