import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  authorAndDate: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
  },
  date: {
    color: theme.palette.grey.graphite,
  },
  separator: {
    backgroundColor: theme.palette.grey.grey,
    borderRadius: UI_SIZES.radius.small,
    height: getScaleWidth(15),
    width: getScaleWidth(1),
  },
});
