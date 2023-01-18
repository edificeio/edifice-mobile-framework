import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleHeight } from '~/framework/components/constants';

export default StyleSheet.create({
  mediaIcon: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: getScaleHeight(40),
    width: getScaleHeight(40),
    borderRadius: UI_SIZES.radius.huge,
    backgroundColor: theme.palette.primary.regular,
    opacity: 1,
  },
  icon: {
    transform: [{ translateX: 2 }],
  },
});
