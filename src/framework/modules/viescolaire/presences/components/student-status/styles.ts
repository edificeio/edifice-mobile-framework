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
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    marginTop: UI_SIZES.spacing.minor,
  },
  nameContainer: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
  },
  separatorContainer: {
    backgroundColor: theme.palette.grey.cloudy,
    height: 1,
    marginHorizontal: UI_SIZES.spacing.minor,
  },
});
