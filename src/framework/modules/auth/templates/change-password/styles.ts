import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  alert: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  buttons: {
    marginTop: UI_SIZES.spacing.big,
  },
  infos: {
    alignItems: 'center',
  },
  infosText: {
    marginBottom: UI_SIZES.spacing.big,
    marginTop: UI_SIZES.spacing.medium,
    textAlign: 'center',
  },
  inputNewPassword: {
    marginVertical: UI_SIZES.spacing.minor,
  },
  page: {
    backgroundColor: theme.palette.grey.white,
    padding: UI_SIZES.spacing.big,
  },
  pressable: {
    flexGrow: 1,
  },
});
