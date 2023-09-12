import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  header: {
    borderWidth: 1,
    borderColor: theme.palette.grey.cloudy,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  content: {
    padding: UI_SIZES.spacing.medium,
  },
});

export default styles;
