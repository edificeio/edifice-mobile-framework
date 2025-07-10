import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  activeContainer: {
    backgroundColor: theme.palette.grey.white,
  },
  badge: {
    marginLeft: UI_SIZES.spacing.tiny,
  },
  container: {
    alignItems: 'center',
    borderColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.input,
    borderWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    height: getScaleWidth(46),
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.tiny,
    width: getScaleWidth(124),
  },
  inactiveContainer: {
    backgroundColor: theme.palette.grey.white,
  },
  innerActive: {
    alignItems: 'center',
    backgroundColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.medium,
    flexDirection: 'row',
    height: getScaleWidth(38),
    justifyContent: 'center',
    width: getScaleWidth(116),
  },
});
