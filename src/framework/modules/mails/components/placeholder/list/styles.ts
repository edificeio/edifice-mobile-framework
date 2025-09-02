import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  cloudy: {
    backgroundColor: theme.palette.grey.cloudy,
  },
  grey: {
    backgroundColor: theme.palette.grey.grey,
  },
  h20: {
    borderRadius: UI_SIZES.radius.card,
    height: 20,
  },
  item: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },

  itemFirstLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
    rowGap: UI_SIZES.spacing.tiny,
  },

  mb0: {
    marginBottom: 0,
  },
  page: {
    rowGap: UI_SIZES.spacing.tiny,
  },
});
