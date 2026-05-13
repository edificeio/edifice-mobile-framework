import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleHeight, getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  bottomSheetContainer: {
    paddingBottom: UI_SIZES.spacing.large,
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  bottomSheetContent: {
    backgroundColor: theme.ui.background.card,
    borderTopLeftRadius: UI_SIZES.radius.extraLarge,
    borderTopRightRadius: UI_SIZES.radius.extraLarge,
    paddingBottom: UI_SIZES.screen.bottomInset,
    paddingTop: UI_SIZES.spacing.medium,
  },
  bottomSheetHandle: {
    alignSelf: 'center',
    backgroundColor: theme.palette.grey.grey,
    borderRadius: getScaleWidth(2.5),
    height: getScaleHeight(4),
    width: getScaleWidth(37),
  },
  bottomSheetHeader: {
    alignItems: 'flex-start',
    marginBottom: UI_SIZES.spacing.medium,
    marginHorizontal: UI_SIZES.spacing.big,
  },
  bottomSheetModal: {
    justifyContent: 'flex-end',
    margin: 0,
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
