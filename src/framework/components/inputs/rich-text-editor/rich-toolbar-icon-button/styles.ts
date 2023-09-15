import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  item: {
    padding: UI_SIZES.spacing.minor,
    borderRadius: UI_SIZES.radius.medium,
    alignSelf: 'flex-start',
  },
  itemSelected: {
    backgroundColor: theme.palette.primary.pale,
  },
});

export default styles;
