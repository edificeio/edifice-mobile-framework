import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.ui.background.card },
  flexGrow1: { flexGrow: 1 },
  cguWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: UI_SIZES.spacing.big,
  },
  cguText: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    flex: 1,
  },
  errorMsg: {
    flexGrow: 0,
    marginTop: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
    alignSelf: 'center',
    color: theme.palette.status.failure.regular,
  },
  alertCard: { marginTop: UI_SIZES.spacing.medium },
});
