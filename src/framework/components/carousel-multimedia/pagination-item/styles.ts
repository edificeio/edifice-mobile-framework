import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  itemContainer: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.darkness,
    borderRadius: UI_SIZES.radius.small,
    height: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  thumbnail: {
    height: '100%',
    width: '100%',
  },
  videoIcon: {
    left: '50%',
    position: 'absolute',
    top: '50%',
  },
});

export default styles;
