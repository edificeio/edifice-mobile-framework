import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleHeight, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  cardExplorer: {
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: 1,
  },

  h16: {
    height: 16,
  },
  //GLOBAL
  h22: {
    height: 22,
  },

  mb0: {
    marginBottom: 0,
  },

  //DETAILS
  page: {
    columnGap: UI_SIZES.spacing.medium,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: UI_SIZES.spacing.medium,
    rowGap: UI_SIZES.spacing.medium,
  },
  pearl: {
    backgroundColor: theme.palette.grey.pearl,
  },
  pic: {
    borderTopLeftRadius: UI_SIZES.radius.mediumPlus,
    borderTopRightRadius: UI_SIZES.radius.mediumPlus,
    height: getScaleHeight(100),
  },
  texts: {
    padding: UI_SIZES.spacing.small,
  },
});
