import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  page: {
    backgroundColor: theme.palette.grey.white,
  },
  version: {
    color: theme.palette.grey.graphite,
    margin: UI_SIZES.spacing.medium,
  },
});
