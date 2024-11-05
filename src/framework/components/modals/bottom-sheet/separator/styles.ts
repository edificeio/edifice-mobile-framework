import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  container: {
    borderBottomColor: theme.palette.grey.cloudy,
    borderBottomWidth: 1,
    marginHorizontal: UI_SIZES.spacing.minor,
    marginVertical: UI_SIZES.spacing.small,
  },
});

export default styles;
