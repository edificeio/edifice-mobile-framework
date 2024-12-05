import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    borderRadius: UI_SIZES.radius.selector,
    columnGap: UI_SIZES.spacing.small,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  isSelected: {
    backgroundColor: theme.palette.primary.pale,
  },
  text: {
    flex: 1,
  },
  nbUnread: {
    backgroundColor: theme.palette.secondary.regular,
    paddingHorizontal: UI_SIZES.spacing.minor,

    borderRadius: UI_SIZES.radius.big,
    flexDirection: 'row',
  },
  nbUnreadText: {
    color: theme.palette.grey.white,
  },
});
