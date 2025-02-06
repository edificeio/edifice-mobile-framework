import { StyleSheet } from 'react-native';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: UI_SIZES.spacing.tiny,
    paddingVertical: UI_SIZES.spacing.minor,
    columnGap: UI_SIZES.spacing.minor,
    zIndex: -1,
  },
  containerSelected: {
    paddingRight: UI_SIZES.spacing.tiny + UI_SIZES.elements.icon.small,
  },
  selectedView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.palette.grey.white,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
