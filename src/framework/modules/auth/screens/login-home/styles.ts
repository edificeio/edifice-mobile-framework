import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  boxButtonAndTextForgot: {
    alignItems: 'center',
    flexGrow: 2,
    justifyContent: 'flex-start',
  },
  boxTextForgot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  federatedAccount: {
    textDecorationLine: 'underline',
    marginTop: UI_SIZES.spacing.major,
    textAlign: 'center',
  },
  inputCheckbox: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginTop: UI_SIZES.spacing.medium,
  },
  logo: {
    flexGrow: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  textError: {
    flexGrow: 0,
    marginTop: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
    alignSelf: 'center',
    color: theme.palette.status.failure.regular,
  },
  textForgotId: {
    textDecorationLine: 'underline',
    marginTop: UI_SIZES.spacing.medium,
    color: theme.ui.text.light,
  },
  textForgotPassword: {
    textDecorationLine: 'underline',
    marginTop: UI_SIZES.spacing.major,
    color: theme.ui.text.light,
  },
  scrollview: {
    flexGrow: 1,
  },
  view: {
    flex: 1,
  },
});
