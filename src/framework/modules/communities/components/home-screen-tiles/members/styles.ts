import { StyleSheet } from 'react-native';

import { AvatarSizes } from '~/framework/components/avatar/styles';
import { UI_SIZES } from '~/framework/components/constants';
import { baseStyles } from '~/framework/modules/communities/components/home-screen-tiles/styles';

const MEDIUM_AVATAR_HEIGHT = AvatarSizes.md;
const LOADER_HEIGHT = 2 * UI_SIZES.spacing.small + MEDIUM_AVATAR_HEIGHT;

export default StyleSheet.create({
  tileCaptionTextAvailable: {
    ...baseStyles.tileCaptionTextAvailable,
  },
  tileLoader: {
    borderRadius: UI_SIZES.radius.newCard,
    height: LOADER_HEIGHT,
    width: '100%',
  },
  tileMembers: {
    ...baseStyles.tileBase,
    ...baseStyles.tileAvailable,
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.medium,
  },
});
