import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
  },
  listContainer: {
    flex: 1,
    paddingBottom: UI_SIZES.screen.bottomInset,
  },
  search: {
    borderColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.extraLarge,
    height: getScaleWidth(40),
    width: '100%',
  },
  searchContainer: {
    height: getScaleWidth(56),
    paddingBottom: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.small,
  },
});
