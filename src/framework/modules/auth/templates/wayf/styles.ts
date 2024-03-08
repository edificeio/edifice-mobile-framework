import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: UI_SIZES.spacing.large,
    paddingVertical: UI_SIZES.spacing.huge * 1.5,
  },
  safeView: { flex: 1, backgroundColor: theme.ui.background.card },
  select: { borderColor: theme.palette.primary.regular, borderWidth: 1, marginTop: UI_SIZES.spacing.medium },
  selectBackDrop: { flex: 1 },
  selectContainer: {
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
    maxHeight: 120,
    marginTop: UI_SIZES.spacing.medium,
  },
  selectPlaceholder: { color: theme.ui.text.light },
  selectText: { color: theme.ui.text.light },
  text: { textAlign: 'center' },
  webview: { flex: 1 },
  errorMsg: {
    flexGrow: 0,
    marginTop: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
    alignSelf: 'center',
    color: theme.palette.status.failure.regular,
  },
  submitButton: {
    zIndex: -1,
  },
});
