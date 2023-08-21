import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  page: {
    padding: UI_SIZES.spacing.big,
  },
  pressable: {
    flexGrow: 1,
  },
  alert: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  infos: {
    alignItems: 'center',
  },
  infosText: {
    textAlign: 'center',
    marginTop: UI_SIZES.spacing.medium,
    marginBottom: UI_SIZES.spacing.big,
  },
  inputNewPassword: {
    marginVertical: UI_SIZES.spacing.minor,
  },
  buttons: {
    marginTop: UI_SIZES.spacing.big,
  },
});
