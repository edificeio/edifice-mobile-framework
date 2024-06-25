import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  separator: {
    marginHorizontal: UI_SIZES.spacing.minor,
    marginVertical: UI_SIZES.spacing.tiny,
    height: UI_SIZES.elements.icon.default,
    width: 1,
    backgroundColor: theme.palette.grey.cloudy,
  },
});

export default styles;
