import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  cardPinned: {
    borderColor: theme.palette.complementary.purple.light,
    borderWidth: UI_SIZES.border.small,
  },
  needValidation: {
    color: theme.palette.status.warning.regular,
  },
  pinnedPill: {
    alignSelf: 'flex-start',
    marginTop: UI_SIZES.spacing.minor,
  },
  textAboveMedia: {
    marginBottom: UI_SIZES.spacing.small,
  },
});

export default styles;
