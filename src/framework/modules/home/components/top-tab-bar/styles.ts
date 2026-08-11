import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  blur: {
    backgroundColor: theme.palette.grey.white.toString(),
    flex: 1,
    opacity: 0.6,
  },
  blurFocused: {
    opacity: 0,
  },
  blurs: {
    flexDirection: 'row',
  },
  container: {
    backgroundColor: theme.ui.navigation.navBar.background.toString(),
  },
  label: {
    color: theme.ui.navigation.navBar.tint.toString(),
  },
  labelContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.tiny,
    paddingBottom: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingTop: UI_SIZES.spacing.minor,
  },
  line: {
    bottom: 0,
    height: UI_SIZES.border.small,
    position: 'absolute',
    width: '100%',
  },
  tab: {
    alignItems: 'center',
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
  },
});
