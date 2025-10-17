import { StyleSheet } from 'react-native';

import * as Avatar from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const AvatarSizes = {
  [Avatar.Size.sm]: UI_SIZES.elements.avatar.sm,
  [Avatar.Size.md]: UI_SIZES.elements.avatar.md,
  [Avatar.Size.lg]: UI_SIZES.elements.avatar.lg,
  [Avatar.Size.xl]: UI_SIZES.elements.avatar.xl,
  [Avatar.Size.xxl]: UI_SIZES.elements.avatar.xxl,
};

export default StyleSheet.create({
  avatarStack: {
    flexDirection: 'row',
  },
  container: {
    alignItems: 'stretch',
    justifyContent: 'center',
    position: 'relative',
  },
  innerImage: {
    height: '100%',
    width: '100%',
  },
  overlay: {
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.ui.overlay.light,
    justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
  },
  overlayText: {
    color: theme.ui.text.inverse,
  },
  singleAvatar: {},
});
