import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  card: {
    backgroundColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.card,
    gap: UI_SIZES.spacing.minor,
    overflow: 'hidden',
    padding: UI_SIZES.spacing.medium,
    paddingLeft: UI_SIZES.spacing.big,
  },
  cardItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
  },
  cardItemIcon: {
    flex: 0,
  },
  cardItemText: {
    flex: 1,
  },
  cardLine: {
    backgroundColor: theme.palette.primary.regular,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: UI_SIZES.border.normal,
  },
  close: {
    left: UI_SIZES.spacing.medium,
    position: 'absolute',
    top: 0,
  },
  modal: {},
  page: {
    gap: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.small,
  },
  text: {
    textAlign: 'center',
  },
});
