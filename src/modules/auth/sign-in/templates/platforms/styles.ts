import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleFontSize, getScaleHeight, getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  cardLabelText: {
    fontSize: UI_SIZES.spacing.small,
    lineHeight: getScaleFontSize(20),
  },
  cardStyle: {
    paddingVertical: UI_SIZES.spacing.minor,
  },
  heading: {
    color: theme.ui.text.regular,
    marginBottom: UI_SIZES.spacing.big,
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  lightP: {
    color: theme.palette.primary.regular,
    marginBottom: UI_SIZES.spacing.small,
    textAlign: 'center',
  },
  picture: { height: getScaleHeight(50), maxWidth: getScaleWidth(112), width: '100%' },
});
