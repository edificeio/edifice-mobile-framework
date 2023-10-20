import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  addAccount: {
    alignSelf: 'baseline',
    marginTop: UI_SIZES.spacing.small,
  },
  separator: {
    height: UI_SIZES.border.thin,
    backgroundColor: theme.palette.grey.cloudy,
  },
  separatorContainer: {
    paddingVertical: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.minor,
  },
  textContainer: {
    marginBottom: UI_SIZES.spacing.big,
  },
});
