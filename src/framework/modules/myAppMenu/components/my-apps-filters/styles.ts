import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  activeAnimatedContainer: { borderWidth: 1 },
  animatedSearchContainer: {
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
    height: getScaleWidth(40),
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  cancelTextStyle: {
    fontWeight: 'bold',
  },
  clearButtonColor: {
    color: theme.palette.grey.black,
    paddingLeft: UI_SIZES.spacing.minor,
    paddingRight: UI_SIZES.spacing.small,
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
  // eslint-disable-next-line react-native/no-color-literals
  search: {
    backgroundColor: 'transparent',
    borderRadius: UI_SIZES.radius.extraLarge,
    borderWidth: 0,
    height: getScaleWidth(40),
  },
  searchContainerWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.medium,
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
    marginRight: UI_SIZES.spacing.tiny,
  },
  unselectedButton: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
  },
  unselectedText: {
    color: theme.palette.primary.regular,
  },
});
