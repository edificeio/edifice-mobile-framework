import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const baseStyles = StyleSheet.create({
  tileAvailable: {
    backgroundColor: theme.palette.primary.pale,
  },
  tileBase: {
    alignItems: 'flex-start',
    borderRadius: UI_SIZES.radius.newCard,
    flex: 1,
    padding: UI_SIZES.spacing.small,
  },
});

const MEDIUM_AVATAR_HEIGHT = getScaleWidth(32);
const LOADER_HEIGHT = 2 * (UI_SIZES.spacing.small + UI_SIZES.border.small) + MEDIUM_AVATAR_HEIGHT;

export default StyleSheet.create({
  tileCaptionTextAvailable: {
    color: theme.palette.primary.regular,
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
