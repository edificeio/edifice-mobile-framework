import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleHeight } from '~/framework/components/constants';

export default StyleSheet.create({
  noFlexShrink: {
    flexShrink: 0,
  },
  pressable: {
    flexGrow: 1,
  },
  textError: {
    flexGrow: 0,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
    alignSelf: 'center',
    color: theme.palette.status.failure.regular,
    marginTop: 0,
    minHeight: getScaleHeight(20) * 3,
  },
  textWarning: {
    textAlign: 'center',
  },
  viewInfoForm: {
    flexShrink: 0,
    alignItems: 'stretch',
  },
  viewWarning: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: UI_SIZES.spacing.tiny,
    flex: 0,
  },
});
