import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  containerUnread: {
    backgroundColor: theme.palette.secondary.pale,
  },
  date: {
    color: theme.palette.grey.graphite,
  },
  line: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  responseIcon: {
    marginLeft: UI_SIZES.spacing.small,
  },
  texts: {
    flex: 1,
    marginLeft: UI_SIZES.spacing.small,
  },
});
