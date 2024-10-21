import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  page: {
    backgroundColor: theme.palette.grey.white,
  },
  section: {
    padding: UI_SIZES.spacing.medium,
  },
  title: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.small,
  },
  titleIcon: {
    marginRight: UI_SIZES.spacing.minor,
  },
});
