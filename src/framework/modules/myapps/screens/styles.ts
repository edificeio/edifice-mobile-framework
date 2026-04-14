import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  bottomSheetContainer: {
    paddingBottom: UI_SIZES.spacing.large,
  },
  emptyScreen: { flex: 1, justifyContent: 'center' },
  separatorLine: {
    backgroundColor: theme.palette.grey.cloudy,
    height: 1,
    marginVertical: UI_SIZES.spacing.minor,
    width: '100%',
  },
  tabBarStyle: {
    opacity: 0,
    pointerEvents: 'none',
    position: 'absolute',
  },
});
