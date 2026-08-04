import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    backgroundColor: theme.palette.grey.white.toString(),
    flexDirection: 'row',
  },
  // Always rendered, transparent when inactive, so switching tabs doesn't shift the layout.
  indicator: {
    backgroundColor: theme.palette.primary.light.toString(),
    borderTopLeftRadius: UI_SIZES.radius.small,
    borderTopRightRadius: UI_SIZES.radius.small,
    height: UI_SIZES.border.normal,
    width: '100%',
  },
  indicatorFocused: {
    backgroundColor: theme.palette.primary.regular.toString(),
  },
  label: {
    color: theme.ui.text.light.toString(),
  },
  labelContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.tiny,
    paddingBottom: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingTop: UI_SIZES.spacing.minor,
  },
  labelFocused: {
    color: theme.ui.text.regular.toString(),
  },
  tab: {
    alignItems: 'center',
    flex: 1,
  },
});
