import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  cardBlog: {
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: 1,
    marginBottom: UI_SIZES.spacing.big,
    padding: UI_SIZES.spacing.small,
  },

  cardBlog_avatar: {
    marginRight: UI_SIZES.spacing.minor,
  },

  h18: {
    height: 18,
  },

  cardBlog_top: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.small,
  },

  h22: {
    height: 22,
  },

  h24: {
    height: 24,
  },

  //GLOBAL
  h72: {
    height: 72,
  },

  mb0: {
    marginBottom: 0,
  },
  //DETAILS
  page: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.big,
  },
  pearl: {
    backgroundColor: theme.palette.grey.pearl,
  },
});
