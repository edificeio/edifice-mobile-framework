import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  page: {
    rowGap: UI_SIZES.spacing.tiny,
  },
  item: {
    paddingVertical: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.medium,
    flexDirection: 'row',
    columnGap: UI_SIZES.spacing.small,
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    rowGap: UI_SIZES.spacing.tiny,
  },
  itemFirstLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  h20: {
    height: 20,
    borderRadius: UI_SIZES.radius.card,
  },
  mb0: {
    marginBottom: 0,
  },

  grey: {
    backgroundColor: theme.palette.grey.grey,
  },
  cloudy: {
    backgroundColor: theme.palette.grey.cloudy,
  },
});
