import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  avatar: {
    marginRight: UI_SIZES.spacing.minor,
  },

  content: {
    backgroundColor: theme.palette.grey.fog,
    height: 750,
    width: '100%',
  },

  date: {
    marginBottom: UI_SIZES.spacing.medium,
  },

  h12: {
    height: 12,
  },

  h18: {
    height: 18,
  },

  //GLOBAL
  h22: {
    height: 22,
  },

  mb0: {
    marginBottom: 0,
  },
  //ELEMENTS
  page: {
    padding: UI_SIZES.spacing.medium,
  },
  pearl: {
    backgroundColor: theme.palette.grey.pearl,
  },
  user: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.medium,
  },
});
