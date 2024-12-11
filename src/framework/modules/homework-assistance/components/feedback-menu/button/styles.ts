import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth } from '~/framework/components/constants';

export const BUTTON_WIDTH = getScaleWidth(48);

export default StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: BUTTON_WIDTH,
    height: BUTTON_WIDTH,
    backgroundColor: theme.palette.primary.regular,
    borderRadius: BUTTON_WIDTH / 2,
  },
});
