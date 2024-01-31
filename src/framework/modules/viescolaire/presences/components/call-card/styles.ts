import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.ui.background.card,
    borderRadius: UI_SIZES.radius.card,
    overflow: 'hidden',
  },
  leftContainer: {
    flexShrink: 1,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
    rowGap: UI_SIZES.spacing.minor,
  },
  rowContainer: {
    flexDirection: 'row',
    flexShrink: 1,
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
  },
  roomText: {
    color: theme.ui.text.light,
  },
  statusContainer: {
    justifyContent: 'center',
    padding: UI_SIZES.spacing.minor,
  },
});
