import { Platform, StyleSheet } from 'react-native';

import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const BUTTON_ICON_SIZE = UI_SIZES.elements.icon.small;

export default StyleSheet.create({
  commonView: {
    alignItems: 'center',
    alignSelf: 'center',
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: UI_SIZES.spacing.tiny,
  },
  disabled: {
    opacity: 0.5,
  },
  indicator: {
    height: BUTTON_ICON_SIZE,
  },
  indicator: {
    height: BUTTON_ICON_SIZE,
  },
  text: {
    // fix vertical alignment in android buttons
    marginTop: Platform.OS === 'android' ? -getScaleWidth(2) : 0,
  },
});
