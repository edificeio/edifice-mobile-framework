import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    zIndex: 1,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.grey.cloudy,
  },
  container: {
    borderRadius: UI_SIZES.radius.medium,
  },
  text: {
    textAlign: 'center',
  },
});
