import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  absoluteContainer: {
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.border.thin,
    position: 'absolute',
    zIndex: 1,
  },
  container: {
    borderRadius: UI_SIZES.radius.medium,
  },
  text: {
    textAlign: 'center',
  },
});
