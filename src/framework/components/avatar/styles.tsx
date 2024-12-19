import { ImageStyle, StyleSheet } from 'react-native';

import * as Avatar from './types';

import { UI_SIZES } from '~/framework/components/constants';

export const AvatarSizes = {
  [Avatar.Size.sm]: UI_SIZES.elements.avatar.sm,
  [Avatar.Size.md]: UI_SIZES.elements.avatar.md,
  [Avatar.Size.lg]: UI_SIZES.elements.avatar.lg,
  [Avatar.Size.xl]: UI_SIZES.elements.avatar.xl,
  [Avatar.Size.xxl]: UI_SIZES.elements.avatar.xxl,
};

export default StyleSheet.create({
  singleAvatar: {} as ImageStyle,
});
