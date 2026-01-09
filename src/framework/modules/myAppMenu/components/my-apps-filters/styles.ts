import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  cancelTextStyle: {
    fontWeight: 'bold',
  },
  container: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.fog,
    borderBottomWidth: 1,
    borderColor: theme.palette.grey.cloudy,
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.medium,
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
    backgroundColor: theme.palette.grey.fog,

    borderBottomWidth: 1,

    borderColor: theme.palette.grey.cloudy,

    flexDirection: 'row',
    gap: getScaleWidth(12),
    justifyContent: 'space-between',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  searchFilterCell: {
    alignItems: 'center',
    borderColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.huge,
    borderWidth: 2,
    height: getScaleWidth(36),
    justifyContent: 'center',
    marginHorizontal: getScaleWidth(5),
    width: getScaleWidth(36),
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
