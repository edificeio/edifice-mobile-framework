import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  keyboardAvoidingView: { backgroundColor: theme.ui.background.card },
  flexGrow1: { flexGrow: 1 },
  inputWrapper: {
    alignSelf: 'stretch',
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: UI_SIZES.spacing.small,
  },
  // inputLine: { color: theme.ui.text.inverse },
  touchable: { height: '100%', width: '100%', position: 'absolute' },
  picker: { width: '100%', borderWidth: 1, borderColor: theme.palette.grey.grey, borderTopWidth: 0 },
  textColorLight: { color: theme.ui.text.light },
  errorMsg: {
    flexGrow: 0,
    marginTop: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
    alignSelf: 'center',
    color: theme.palette.status.failure.regular,
  },
  infoMsg: {
    alignSelf: 'center',
    flexGrow: 0,
    marginTop: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
  },
  buttonWrapper: {
    alignItems: 'center',
    flexGrow: 2,
    justifyContent: 'flex-start',
  },
});

export default styles;
