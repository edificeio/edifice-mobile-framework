import { StyleSheet } from 'react-native';

import { AvatarSize } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const NewAvatarSizes = {
  [AvatarSize.sm]: UI_SIZES.elements.avatar.sm,
  [AvatarSize.md]: UI_SIZES.elements.avatar.md,
  [AvatarSize.lg]: UI_SIZES.elements.avatar.lg,
  [AvatarSize.xl]: UI_SIZES.elements.avatar.xl,
  [AvatarSize.xxl]: UI_SIZES.elements.avatar.xxl,
};

const styles = StyleSheet.create({
  border: {
    backgroundColor: theme.palette.grey.white,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pic: {
    backgroundColor: theme.palette.grey.white,
  },
});

export default styles;
