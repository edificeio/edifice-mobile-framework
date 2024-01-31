import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    rowGap: UI_SIZES.spacing.small,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
    marginBottom: UI_SIZES.spacing.small,
  },
  separatorContainer: {
    height: 1,
    marginHorizontal: UI_SIZES.spacing.minor,
    backgroundColor: theme.palette.grey.cloudy,
  },
});
