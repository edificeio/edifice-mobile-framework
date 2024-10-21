import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  buttonWrapper: {
    alignItems: 'center',
    flexGrow: 2,
    justifyContent: 'flex-start',
  },
  errorMsg: {
    alignSelf: 'center',
    color: theme.palette.status.failure.regular,
    flexGrow: 0,
    marginTop: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
  },
  flexGrow1: { flexGrow: 1 },

  infoMsg: {
    alignSelf: 'center',
    flexGrow: 0,
    marginTop: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
  },

  inputWrapper: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: UI_SIZES.spacing.small,
  },

  keyboardAvoidingView: { backgroundColor: theme.ui.background.card },

  picker: { borderColor: theme.palette.grey.grey, borderTopWidth: 0, borderWidth: 1, width: '100%' },

  textColorLight: { color: theme.ui.text.light },
  // inputLine: { color: theme.ui.text.inverse },
  touchable: { height: '100%', position: 'absolute', width: '100%' },
});

export default styles;
