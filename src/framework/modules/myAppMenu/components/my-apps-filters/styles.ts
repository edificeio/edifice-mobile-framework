import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

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
    justifyContent: 'center',
    paddingVertical: UI_SIZES.spacing.small,
  },
  list: {
    flexGrow: 0,
    flexShrink: 0,
  },
  search: {
    borderColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.extraLarge,
    borderWidth: 0,
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
    flex: 1,
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
