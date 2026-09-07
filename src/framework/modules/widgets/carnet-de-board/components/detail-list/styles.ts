import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  date: {
    color: theme.palette.grey.graphite,
  },
  list: {
    backgroundColor: theme.ui.background.card,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.extraLarge,
    borderWidth: UI_SIZES.border.thin,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: UI_SIZES.spacing.medium,
  },
  rowSeparated: {
    borderBottomColor: theme.palette.grey.cloudy,
    borderBottomWidth: UI_SIZES.border.thin,
  },
  rowText: {
    flex: 1,
    gap: UI_SIZES.spacing.tinyExtra,
  },
  rowValue: {
    flex: 0,
    marginLeft: UI_SIZES.spacing.small,
    textAlign: 'right',
  },
});
