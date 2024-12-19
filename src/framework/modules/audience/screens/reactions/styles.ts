import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.palette.grey.white,
    padding: UI_SIZES.spacing.medium,
  },
  flatlist: {
    paddingTop: UI_SIZES.spacing.medium,
  },
  headerItem: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.minor,
    flexDirection: 'row',
  },
  headerItemTextFocused: {
    color: theme.palette.primary.regular,
  },
  item: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  noReactionTitle: {
    color: theme.palette.grey.black,
  },
  noReactionView: {
    backgroundColor: theme.palette.grey.white,
  },
  tabBarContainer: {
    backgroundColor: theme.palette.grey.white,
    borderBottomColor: theme.palette.grey.cloudy,
    borderBottomWidth: UI_SIZES.border.thin,
  },

  tabBarIndicatorContainer: {
    backgroundColor: theme.palette.primary.regular,
    height: 2,
  },
});

export default styles;
