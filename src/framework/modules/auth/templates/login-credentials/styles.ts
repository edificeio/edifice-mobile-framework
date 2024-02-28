import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

export default StyleSheet.create({
  boxError: {
    marginTop: UI_SIZES.spacing.medium,
    marginBottom: UI_SIZES.spacing.big,
  },
  boxButtons: {
    alignItems: 'center',
    flexGrow: 2,
    justifyContent: 'flex-start',
  },
  boxButtonsNoError: {
    marginTop: getScaleWidth(72),
  },
  boxInputs: {
    alignSelf: 'stretch',
  },
  boxTextForgot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotPasswordButton: {
    marginTop: UI_SIZES.spacing.big,
    marginBottom: UI_SIZES.spacing.tiny,
  },
  form: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.large,
  },
  inputPassword: {
    marginTop: UI_SIZES.spacing.big,
  },
  inputCheckbox: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginTop: UI_SIZES.spacing.medium,
  },
  pageView: {
    backgroundColor: theme.ui.background.card,
  },
  platform: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: UI_SIZES.spacing.large,
  },
  platformLogo: {
    height: UI_SIZES.elements.logoSize.height,
  },
  platformName: {
    marginTop: UI_SIZES.spacing.medium,
  },
  userError: {
    alignItems: 'center',
  },
  userTextError: {
    textAlign: 'center',
    color: theme.palette.status.failure.regular,
    marginTop: UI_SIZES.spacing.minor,
  },
  scrollview: {
    flexGrow: 1,
  },
});
