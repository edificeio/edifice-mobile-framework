import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleFontSize, getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const CELL_HEIGHT = 32;

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.huge,
    borderWidth: 2,
    height: CELL_HEIGHT,
    justifyContent: 'center',
    marginHorizontal: getScaleWidth(5),
    paddingHorizontal: UI_SIZES.spacing.medium,
  },

  pressed: {
    opacity: 0.85,
  },

  selected: {
    backgroundColor: theme.palette.primary.regular,
    borderColor: theme.palette.primary.regular,
  },

  text: {
    fontSize: getScaleFontSize(16),
    textAlign: 'center',
  },

  textSelected: {
    color: theme.palette.grey.white,
  },

  textUnselected: {
    color: theme.ui.text.regular,
  },

  unselected: {
    borderColor: theme.palette.primary.regular,
  },
});
