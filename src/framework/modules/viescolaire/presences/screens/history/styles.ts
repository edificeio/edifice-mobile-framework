import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

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
  pageContainer: {
    backgroundColor: theme.palette.grey.white,
  },
  tabBarContainer: {
    backgroundColor: theme.palette.grey.white,
    borderBottomWidth: UI_SIZES.border.thin,
    borderBottomColor: theme.palette.grey.cloudy,
    elevation: 0,
  },
  tabBarIndicatorContainer: {
    height: 2,
    backgroundColor: theme.palette.primary.regular,
  },
  tabBarLabel: {
    paddingRight: UI_SIZES.spacing.minor, // fix to android trimming last character
  },
  tabBarLabelFocused: {
    color: theme.palette.primary.regular,
  },
  tabBarTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
  },
});
