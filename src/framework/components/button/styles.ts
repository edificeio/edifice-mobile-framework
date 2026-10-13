import { StyleSheet } from 'react-native';

import theme from '~/app/theme';

import { UI_SIZES } from '../constants';
import { TextSizeStyle } from '../text';

export default StyleSheet.create({
  base: {
    alignItems: 'center',
    flex: 0,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
    justifyContent: 'center',
    minHeight: 2 * UI_SIZES.spacing.minor + TextSizeStyle.Normal.lineHeight,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  basePill: {},
  basePillText: {},
  baseRect: {
    borderRadius: UI_SIZES.radius.medium,
  },
  baseRectText: {},
  baseRound: {
    aspectRatio: 1,
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  ghost: {
    borderColor: theme.palette.grey.cloudy,
  },
  ghostActive: {},
  ghostDisabled: {},
  ghostOutline: {
    borderWidth: UI_SIZES.border.thin,
    paddingHorizontal: UI_SIZES.spacing.medium - UI_SIZES.border.thin,
    paddingVertical: UI_SIZES.spacing.minor - UI_SIZES.border.thin,
  },
  group: {
    alignItems: 'stretch',
    alignSelf: 'center',
    flex: 0,
    flexDirection: 'column',
    gap: UI_SIZES.spacing.medium,
  },
  primary: {
    backgroundColor: theme.ui.button.background,
  },
  primaryActive: {
    backgroundColor: theme.ui.button.pressedBackground,
  },
  primaryDisabled: {
    backgroundColor: theme.ui.button.disabledBackground,
  },
  secondary: {
    borderColor: theme.ui.button.background,
    borderWidth: UI_SIZES.border.thin,
    paddingHorizontal: UI_SIZES.spacing.medium - UI_SIZES.border.thin,
    paddingVertical: UI_SIZES.spacing.minor - UI_SIZES.border.thin,
  },
  secondaryActive: {
    // Themes that light nothing up on press leave the wash out, and the button keeps its surface.
    backgroundColor: theme.ui.button.highlight,
    borderColor: theme.ui.button.pressedBackground,
  },
  secondaryDisabled: {
    borderColor: theme.ui.button.disabledBackground,
  },
  wrapper: { alignItems: 'stretch', flex: 0 },
});
