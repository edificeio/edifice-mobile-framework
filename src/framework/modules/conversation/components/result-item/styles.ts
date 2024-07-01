import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

import { avatarSize } from './component';

export default StyleSheet.create({
  avatarView: {
    width: avatarSize,
    aspectRatio: 1,
    padding: UI_SIZES.spacing.minor,
    borderRadius: UI_SIZES.radius.huge,
    backgroundColor: theme.palette.primary.pale,
  },
  avatarViewBookmark: {
    backgroundColor: theme.palette.complementary.yellow.pale,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: UI_SIZES.spacing.tiny,
    paddingVertical: UI_SIZES.spacing.minor,
    columnGap: UI_SIZES.spacing.minor,
  },
  black: {
    color: theme.palette.grey.black,
  },
  graphite: {
    color: theme.palette.grey.graphite,
  },
});
