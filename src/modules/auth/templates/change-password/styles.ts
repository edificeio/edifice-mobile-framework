import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  buttons: {
    marginTop: UI_SIZES.spacing.big,
  },
  /** Slot under the form (a secondary action...), centered. */
  formFooter: {
    alignItems: 'center',
    marginTop: UI_SIZES.spacing.minor,
  },
  /** Slot above the form (a message...). */
  formHeader: {
    marginBottom: UI_SIZES.spacing.medium,
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
    padding: UI_SIZES.spacing.big,
  },
  pressable: {
    flexGrow: 1,
  },
});
