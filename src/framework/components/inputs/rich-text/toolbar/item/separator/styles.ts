import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  separator: {
    backgroundColor: theme.palette.grey.cloudy,
    height: UI_SIZES.elements.icon.default,
    marginHorizontal: UI_SIZES.spacing.minor,
    marginVertical: UI_SIZES.spacing.tiny,
    width: 1,
  },
});

export default styles;
