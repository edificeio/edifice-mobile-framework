import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  chipButton: {
    alignItems: 'center',
    backgroundColor: theme.ui.background.card,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    height: UI_SIZES.dimensions.height.huge,
    justifyContent: 'center',
    marginRight: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.small,
  },
  chipsContainer: {
    paddingBottom: UI_SIZES.spacing.minor,
    paddingTop: UI_SIZES.spacing.small,
  },
  chipsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.small,
  },
  chipsText: {
    marginLeft: UI_SIZES.spacing._LEGACY_tiny,
  },
  chipsTitle: {
    color: theme.palette.grey.black,
    marginBottom: UI_SIZES.spacing.tiny,
    marginLeft: UI_SIZES.spacing.medium,
  },
});
