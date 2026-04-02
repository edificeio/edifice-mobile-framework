import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const LOADER_ICON_SIZE = UI_SIZES.elements.icon.xlarge;

export default StyleSheet.create({
  loaderContainer: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.darkness,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
