import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    rowGap: UI_SIZES.spacing.medium,
  },
  eventTypeText: {
    marginLeft: UI_SIZES.spacing.minor,
    marginRight: UI_SIZES.spacing.tiny,
  },
  lightText: {
    color: theme.ui.text.light,
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryEventContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.tiny,
  },
  secondaryEventText: {
    color: theme.palette.status.warning.regular,
  },
  eventTypeGap: {
    columnGap: UI_SIZES.spacing.medium,
  },
});
