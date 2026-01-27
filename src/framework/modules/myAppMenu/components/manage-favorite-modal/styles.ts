import { StyleSheet } from 'react-native';

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
