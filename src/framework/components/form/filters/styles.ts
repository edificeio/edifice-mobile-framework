import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  content: {
    marginBottom: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  itemActive: {
    backgroundColor: theme.palette.primary.pale,
  },
  itemInactive: {
    backgroundColor: theme.palette.grey.white,
  },
  listItem: {
    alignItems: 'center',
    borderBottomWidth: 0,
    borderRadius: UI_SIZES.radius.card,
    marginTop: UI_SIZES.spacing.tiny,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  listTitle: {
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.small,
  },
});
