import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  //GLOBAL
  h22: {
    height: 22,
  },
  h18: {
    height: 18,
  },
  h12: {
    height: 12,
  },
  mb0: {
    marginBottom: 0,
  },
  pearl: {
    backgroundColor: theme.palette.grey.pearl,
  },
  //ELEMENTS
  page: {
    padding: UI_SIZES.spacing.medium,
  },
  user: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.medium,
  },
  avatar: {
    marginRight: UI_SIZES.spacing.minor,
  },
  date: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  content: {
    width: '100%',
    height: 750,
    backgroundColor: theme.palette.grey.fog,
  },
});
