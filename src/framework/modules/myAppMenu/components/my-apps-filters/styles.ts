import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  animatedSearchContainer: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 2,
    height: getScaleWidth(40),
    justifyContent: 'center',
    overflow: 'hidden',
  },

  cancelTextStyle: {
    fontWeight: 'bold',
  },

  container: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.fog,
    borderBottomWidth: 1,
    borderColor: theme.palette.grey.cloudy,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },

  list: {
    flexGrow: 0,
    flexShrink: 0,
  },

  search: {
    borderRadius: UI_SIZES.radius.extraLarge,
    height: getScaleWidth(36),
    width: '100%',
  },

  searchContainerWrapper: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.fog,
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
    // backgroundColor: 'none',
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
  },
  unselectedText: {
    color: theme.palette.primary.regular,
  },
});
