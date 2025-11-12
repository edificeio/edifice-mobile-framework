import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleFontSize, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  chipButton: {
    alignItems: 'center',
    backgroundColor: theme.ui.background.card,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    height: UI_SIZES.dimensions.height.largerPlus,
    justifyContent: 'center',
    marginRight: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.small,
  },
  chipsContainer: {
    paddingBottom: UI_SIZES.spacing.small,
    paddingTop: UI_SIZES.spacing.small,
  },
  chipsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.small,
  },
  chipsText: {
    fontSize: getScaleFontSize(14),
    marginLeft: UI_SIZES.spacing._LEGACY_tiny,
  },
  imagePicture: {
    height: UI_SIZES.elements.icon.xlarge,
    objectFit: 'contain',
    width: UI_SIZES.elements.icon.xlarge,
  },
});
