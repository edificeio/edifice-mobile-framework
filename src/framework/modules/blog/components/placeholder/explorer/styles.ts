import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleHeight } from '~/framework/components/constants';

export default StyleSheet.create({
  //GLOBAL
  h22: {
    height: 22,
  },
  h16: {
    height: 16,
  },
  mb0: {
    marginBottom: 0,
  },
  pearl: {
    backgroundColor: theme.palette.grey.pearl,
  },
  //DETAILS
  page: {
    padding: UI_SIZES.spacing.medium,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: UI_SIZES.spacing.medium,
    rowGap: UI_SIZES.spacing.medium,
  },
  cardExplorer: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: 1,
    borderColor: theme.palette.grey.pearl,
  },
  pic: {
    height: getScaleHeight(100),
    borderTopLeftRadius: UI_SIZES.radius.mediumPlus,
    borderTopRightRadius: UI_SIZES.radius.mediumPlus,
  },
  texts: {
    padding: UI_SIZES.spacing.small,
  },
});
