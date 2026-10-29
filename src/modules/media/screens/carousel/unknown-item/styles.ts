import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: UI_SIZES.spacing.major,
  },
  text: {
    color: theme.palette.grey.white,
    textAlign: 'center',
  },
  textContainer: {
    marginVertical: UI_SIZES.spacing.medium,
  },
});

export default styles;
