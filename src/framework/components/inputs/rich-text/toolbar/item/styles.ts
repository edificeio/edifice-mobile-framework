import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  item: {
    borderRadius: UI_SIZES.radius.medium,
    padding: UI_SIZES.spacing.minor,
  },
  selected: {
    backgroundColor: theme.palette.primary.pale,
  },
});

export default styles;
