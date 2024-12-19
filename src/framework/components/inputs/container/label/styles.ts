import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  label: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.minor,
  },
  labelIcon: {
    marginRight: UI_SIZES.spacing.tiny,
  },
  labelOptional: {
    color: theme.palette.grey.graphite,
  },
  labelRequired: {
    color: theme.palette.status.failure.regular,
  },
});
