import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleHeight, getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  cardStyle: {
    paddingVertical: UI_SIZES.spacing.minor,
  },
  heading: {
    color: theme.ui.text.regular,
    marginBottom: UI_SIZES.spacing.big,
    marginTop: UI_SIZES.spacing.medium,
    textAlign: 'center',
  },
  lightP: {
    color: theme.palette.primary.regular,
    marginBottom: UI_SIZES.spacing.small,
    textAlign: 'center',
  },
  picture: { height: getScaleHeight(50), maxWidth: getScaleWidth(112), width: '100%' },
});
