import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  //GLOBAL
  h32: {
    height: 32,
  },
  h22: {
    height: 22,
  },
  h20: {
    height: 20,
  },
  mb0: {
    marginBottom: 0,
  },
  //ELEMENTS
  page: {
    padding: UI_SIZES.spacing.big,
  },
  user: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.big,
  },
  avatar: {
    marginRight: UI_SIZES.spacing.minor,
  },
  dateTitle: {
    marginBottom: UI_SIZES.spacing.big,
  },
  content: {
    width: '100%',
    height: 750,
    backgroundColor: theme.palette.grey.fog,
  },
});
