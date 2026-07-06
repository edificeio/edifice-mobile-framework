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
    backgroundColor: theme.palette.primary.regular,
  },
  primaryActive: {
    backgroundColor: theme.palette.primary.dark,
  },
  primaryDisabled: {
    backgroundColor: theme.palette.primary.light,
  },
  secondary: {
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.primary.regular,
    borderWidth: UI_SIZES.border.thin,
    paddingHorizontal: UI_SIZES.spacing.medium - UI_SIZES.border.thin,
    paddingVertical: UI_SIZES.spacing.minor - UI_SIZES.border.thin,
  },
  secondaryActive: {
    borderColor: theme.palette.primary.dark,
  },
  secondaryDisabled: {
    borderColor: theme.palette.primary.light,
  },
  terciary: {
    borderColor: theme.palette.primary.regular,
    // no borderWidth on purpose. borderColor is data source for content color
  },
  terciaryActive: { borderColor: theme.palette.primary.dark },
  terciaryDisabled: { borderColor: theme.palette.primary.light },
  wrapper: { alignItems: 'stretch', flex: 0 },
});
