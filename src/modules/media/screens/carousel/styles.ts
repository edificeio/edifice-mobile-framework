import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const SCREEN_HEIGHT = UI_SIZES.screen.height;
export const SCREEN_WIDTH = UI_SIZES.screen.width;

const styles = StyleSheet.create({
  container: { backgroundColor: theme.palette.grey.darkness, flex: 1, flexDirection: 'column' },
  title: {
    width: undefined,
  },
});

export default styles;
