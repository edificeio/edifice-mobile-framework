import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const TOAST_MIN_HEIGHT = 60; // 2 lines of text + padding + border

export default StyleSheet.create({
  card: {
    alignItems: 'stretch',
    backgroundColor: theme.ui.background.card,
    borderRadius: UI_SIZES.radius.medium,
    flex: 0,
    flexDirection: 'row',
    minHeight: TOAST_MIN_HEIGHT,
    overflow: 'hidden',
  },
  cardBorder: {
    flex: 0,
    width: UI_SIZES.radius.medium,
  },
  cardContent: {
    alignItems: 'center',
    borderBottomRightRadius: UI_SIZES.radius.medium,
    borderBottomWidth: UI_SIZES.border.thin,
    borderRightWidth: UI_SIZES.border.thin,
    borderTopRightRadius: UI_SIZES.radius.medium,
    borderTopWidth: UI_SIZES.border.thin,
    flex: 1,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
    justifyContent: 'space-evenly',
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor - UI_SIZES.border.thin,
  },
  cardShadowContainer: {
    borderRadius: UI_SIZES.radius.medium,
    elevation: 16,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  cardText: {
    flex: 1,
  },
});
