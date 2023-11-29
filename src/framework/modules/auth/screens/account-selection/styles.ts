import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  button: {
    marginBottom: UI_SIZES.spacing.minor,
  },
  description: {
    color: theme.palette.grey.graphite,
  },
  page: {
    paddingVertical: UI_SIZES.spacing.big,
    paddingHorizontal: UI_SIZES.spacing.large,
  },
  textContainer: {
    marginVertical: UI_SIZES.spacing.big,
    alignItems: 'center',
  },
  topContainer: {
    alignItems: 'center',
  },
});
