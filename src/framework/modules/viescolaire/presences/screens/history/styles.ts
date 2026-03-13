import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleHeight, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  absenceActionContainer: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  absenceActionTopMargin: {
    marginTop: UI_SIZES.spacing.medium,
  },
  childListContentContainer: {
    padding: UI_SIZES.spacing.medium,
  },
  headerItem: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    position: 'relative',
  },
  pageContainer: {
    backgroundColor: theme.palette.grey.white,
  },
  tabBarContainer: {
    backgroundColor: theme.palette.grey.white,
    borderBottomColor: theme.palette.grey.cloudy,
    borderBottomWidth: UI_SIZES.border.thin,
    elevation: 0,
    flexDirection: 'row',
  },
  tabBarIndicator: {
    backgroundColor: theme.palette.primary.regular,
    bottom: 0,
    height: getScaleHeight(2),
    left: 0,
    position: 'absolute',
    right: 0,
  },
  tabBarItem: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: UI_SIZES.spacing.small,
  },
  tabLabelFocused: {
    color: theme.palette.primary.regular,
  },
});
