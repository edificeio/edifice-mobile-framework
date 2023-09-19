import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  //GLOBAL
  h72: {
    height: 72,
  },
  h24: {
    height: 24,
  },
  h22: {
    height: 22,
  },
  h18: {
    height: 18,
  },
  mb0: {
    marginBottom: 0,
  },
  pearl: {
    backgroundColor: theme.palette.grey.pearl,
  },
  //DETAILS
  page: {
    paddingTop: UI_SIZES.spacing.big,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  cardBlog: {
    backgroundColor: theme.palette.grey.white,
    padding: UI_SIZES.spacing.small,
    marginBottom: UI_SIZES.spacing.big,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: 1,
    borderColor: theme.palette.grey.pearl,
  },
  cardBlog_top: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.small,
  },
  cardBlog_avatar: {
    marginRight: UI_SIZES.spacing.minor,
  },
});
