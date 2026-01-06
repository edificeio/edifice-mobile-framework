import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  content: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.big,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.large,
  },
  item: {
    width: getScaleWidth(120),
  },
  placeholder: {
    backgroundColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.newCard,
    height: getScaleWidth(160),
  },
});
