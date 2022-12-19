import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  picture: {
    marginLeft: UI_SIZES.spacing.minor,
  },
  commonView: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: UI_SIZES.radius.huge,
    borderWidth: UI_SIZES.elements.actionButtonBorder,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  commonViewEnabled: {
    borderColor: theme.palette.primary.regular,
    opacity: 1,
  },
  commonViewDisabled: {
    borderColor: theme.ui.text.light,
    opacity: 0.5,
  },
});
