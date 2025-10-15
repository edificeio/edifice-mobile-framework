import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.small,
    padding: UI_SIZES.spacing.medium,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: UI_SIZES.spacing.tiny,
  },
  name: {
    flex: 1,
  },
});
