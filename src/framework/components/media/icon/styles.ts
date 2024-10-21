import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleHeight, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  mediaIcon: {
    alignItems: 'center',
    backgroundColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.huge,
    display: 'flex',
    height: getScaleHeight(40),
    justifyContent: 'center',
    opacity: 1,
    position: 'absolute',
    width: getScaleHeight(40),
  },
});
