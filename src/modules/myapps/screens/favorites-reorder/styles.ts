import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  infoCard: {
    marginBottom: UI_SIZES.spacing.medium,
    marginHorizontal: UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.spacing.big,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: UI_SIZES.screen.bottomInset + UI_SIZES.spacing.big,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  page: {
    backgroundColor: theme.palette.grey.white,
    flex: 1,
  },
  // The library lays the placeholder out over the full list width, outside of the content padding.
  placeholder: {
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
});
