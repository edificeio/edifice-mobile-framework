import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleHeight, UI_SIZES } from '~/framework/components/constants';

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
    position: 'relative',
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
  tabBarContentContainer: {
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
  tabbarItem: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: UI_SIZES.spacing.small,
  },
});

export default styles;
