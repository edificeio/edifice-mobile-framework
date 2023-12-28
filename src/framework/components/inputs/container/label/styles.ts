import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  labelIcon: {
    marginRight: UI_SIZES.spacing.tiny,
  },
  label: {
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.minor,
    alignItems: 'center',
  },
  labelRequired: {
    color: theme.palette.status.failure.regular,
  },
  labelOptional: {
    color: theme.palette.grey.graphite,
  },
});
