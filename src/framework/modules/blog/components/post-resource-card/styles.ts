import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  cardPinned: {
    borderColor: theme.palette.complementary.purple.light,
    borderWidth: UI_SIZES.border.small,
  },
  pinnedPill: {
    alignSelf: 'flex-start',
    marginTop: UI_SIZES.spacing.minor,
  },
});

export default styles;
