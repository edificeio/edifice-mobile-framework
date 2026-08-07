import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    backgroundColor: theme.ui.background.card.toString(),
    flexDirection: 'row',
  },
  // Drawn under every tab, so switching tabs doesn't shift the layout. Focus only changes its color.
  indicator: {
    backgroundColor: theme.palette.primary.light.toString(),
    borderTopLeftRadius: UI_SIZES.radius.small,
    borderTopRightRadius: UI_SIZES.radius.small,
    height: UI_SIZES.border.small,
    width: '100%',
  },
  indicatorFocused: {
    backgroundColor: theme.palette.primary.regular.toString(),
  },
  label: {
    color: theme.ui.text.regular.toString(),
  },
  labelContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.tiny,
    paddingBottom: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingTop: UI_SIZES.spacing.minor,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
  },
});
