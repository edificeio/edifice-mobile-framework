import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  // Skeleton
  h24: {
    height: 24,
  },
  h30: {
    height: 30,
  },
  mb0: {
    marginBottom: 0,
  },
  placeholderRow: {
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
  },

  stats: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.minor,
  },
  statsItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statsItemText: {
    color: theme.palette.grey.graphite,
    marginRight: UI_SIZES.spacing.minor,
  },
  statsReactions: {
    flexDirection: 'row',
    marginRight: UI_SIZES.spacing.minor,
  },
  statsReactionsItem: {
    marginRight: -UI_SIZES.spacing.minor,
  },
});

export default styles;
