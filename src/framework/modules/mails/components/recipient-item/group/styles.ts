import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  avatar: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: theme.palette.primary.light,
    borderRadius: UI_SIZES.radius.big,
    height: getScaleWidth(24),
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.palette.primary.regular,
    fontSize: getScaleWidth(10),
  },
  flex1: {
    flex: 1,
  },
  graphite: {
    color: theme.palette.grey.graphite,
  },
  idText: {
    color: theme.palette.grey.graphite,
    fontSize: getScaleWidth(10),
  },
});
