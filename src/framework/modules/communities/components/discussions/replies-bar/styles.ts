import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  latestReplyButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.tiny,
  },
  latestReplyText: { color: theme.palette.grey.black },
  repliesCount: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.tiny,
  },
  repliesCountText: { color: theme.palette.grey.graphite },
  root: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.fog,
    borderBottomWidth: UI_SIZES.border.thin,
    borderColor: theme.palette.grey.cloudy,
    borderTopWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingVertical: UI_SIZES.spacing.minor,
  },
});
