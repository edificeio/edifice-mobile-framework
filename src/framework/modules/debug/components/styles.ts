import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  section: {
    margin: UI_SIZES.spacing.medium,
  },
  sectionTitle: {
    color: theme.palette.grey.black,
    marginBottom: UI_SIZES.spacing.small,
  },
});
