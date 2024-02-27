import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  button: {
    marginTop: UI_SIZES.spacing.small,
  },
  content: {
    marginTop: UI_SIZES.spacing.big,
    rowGap: UI_SIZES.spacing.small,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
    marginTop: UI_SIZES.spacing.minor,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
  },
  separatorContainer: {
    height: 1,
    marginHorizontal: UI_SIZES.spacing.minor,
    backgroundColor: theme.palette.grey.cloudy,
  },
});
