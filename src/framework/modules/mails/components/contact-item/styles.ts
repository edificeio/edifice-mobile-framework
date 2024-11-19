import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  avatar: {
    aspectRatio: 1,
    backgroundColor: theme.palette.primary.light,
    borderRadius: UI_SIZES.radius.big,
    height: getScaleWidth(24),
  },
  container: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.big,
    borderWidth: UI_SIZES.border.thin,
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    paddingLeft: UI_SIZES.spacing.tiny,
    paddingRight: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.tinyExtra,
  },
});
