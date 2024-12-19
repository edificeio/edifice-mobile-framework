import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  boxButtons: {
    alignItems: 'center',
    flexGrow: 2,
    justifyContent: 'flex-start',
  },
  boxError: {
    marginBottom: UI_SIZES.spacing.big,
    marginTop: UI_SIZES.spacing.medium,
  },
  boxInputs: {
    alignSelf: 'stretch',
  },
  boxTextForgot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotPasswordButton: {
    marginBottom: UI_SIZES.spacing.tiny,
    marginTop: UI_SIZES.spacing.big,
  },
  form: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.large,
  },
  inputCheckbox: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    marginTop: UI_SIZES.spacing.medium,
  },
  inputPassword: {
    marginTop: UI_SIZES.spacing.big,
  },
  pageView: {
    backgroundColor: theme.ui.background.card,
  },
  platform: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: UI_SIZES.spacing.large,
    width: '100%',
  },
  platformLogo: {
    height: UI_SIZES.elements.logoSize.height,
  },
  platformName: {
    marginTop: UI_SIZES.spacing.medium,
  },
  scrollview: {
    flexGrow: 1,
  },
  userError: {
    alignItems: 'center',
  },
  userTextError: {
    color: theme.palette.status.failure.regular,
    marginTop: UI_SIZES.spacing.minor,
    textAlign: 'center',
  },
});
