import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const TOAST_MIN_HEIGHT = 60; // 2 lines of text + padding + border
const TOAST_PROOGRESS_THICKNESS = 2;

export default StyleSheet.create({
  cardShadowContainer: {
    shadowColor: theme.ui.shadowColor,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    borderRadius: UI_SIZES.radius.medium,
    marginHorizontal: UI_SIZES.spacing.minor,
    elevation: 16,
  },
  card: {
    borderRadius: UI_SIZES.radius.medium,
    flexDirection: 'row',
    alignItems: 'stretch',
    width: UI_SIZES.screen.width - 2 * UI_SIZES.spacing.minor,
    backgroundColor: theme.ui.background.card,
    overflow: 'hidden',
    flex: 0,
    minHeight: TOAST_MIN_HEIGHT,
  },
  cardBorder: {
    width: UI_SIZES.radius.medium,
    flex: 0,
  },
  cardContent: {
    borderTopWidth: UI_SIZES.border.thin,
    borderRightWidth: UI_SIZES.border.thin,
    borderBottomWidth: UI_SIZES.border.thin,
    borderTopRightRadius: UI_SIZES.radius.medium,
    borderBottomRightRadius: UI_SIZES.radius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor - UI_SIZES.border.thin,
    flex: 1,
  },
  cardText: {
    flex: 1,
    // backgroundColor: 'pink',
  },
  progress: {
    position: 'absolute',
    bottom: -UI_SIZES.border.thin,
    left: 0,
    right: 0,
    height: TOAST_PROOGRESS_THICKNESS,
  },
});
