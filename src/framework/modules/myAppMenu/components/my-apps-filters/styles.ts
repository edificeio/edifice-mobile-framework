import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  activeAnimatedContainer: { borderWidth: 0 },
  animatedSearchContainer: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
    height: getScaleWidth(40),
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cancelTextStyle: {
    fontWeight: 'bold',
  },
  clearButtonColor: {
    color: theme.palette.grey.black,
  },
  clickzone: {
    padding: UI_SIZES.spacing.minor,
  },
  container: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.fog,
    borderBottomWidth: 1,
    borderColor: theme.palette.grey.cloudy,
    justifyContent: 'center',
    paddingRight: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.small,
  },
  list: {
    flexGrow: 0,
    flexShrink: 0,
  },
  search: {
    borderColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.extraLarge,
    height: getScaleWidth(40),
    width: '100%',
  },
  searchContainerWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: getScaleWidth(12),
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.small,
  },
  searchIcon: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
  },
  searchInactive: {
    borderColor: theme.palette.grey.cloudy,
  },
  searchOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: theme.palette.primary.regular,
    borderWidth: 0,
  },
  selectedText: {
    color: theme.palette.primary.regular,
  },
  unselectedButton: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
  },
  unselectedText: {
    color: theme.palette.primary.regular,
  },
});
