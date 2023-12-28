import { Platform, StyleSheet } from 'react-native';

import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

export const BUTTON_ICON_SIZE = UI_SIZES.elements.icon.small;

export default StyleSheet.create({
  commonView: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: UI_SIZES.spacing.tiny,
  },
  iconLeft: {
    marginRight: UI_SIZES.spacing.minor,
  },
  iconRight: {
    marginLeft: UI_SIZES.spacing.minor,
  },
  text: {
    // fix vertical alignment in android buttons
    marginTop: Platform.OS === 'android' ? -getScaleWidth(2) : 0,
  },
  indicator: {
    height: BUTTON_ICON_SIZE,
  },
});
