import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  avatarContour: {
    borderWidth: UI_SIZES.border.small,
    borderColor: theme.ui.background.card,
    position: 'absolute',
    zIndex: 1,
    left: -UI_SIZES.spacing._LEGACY_tiny,
    top: -UI_SIZES.spacing._LEGACY_tiny,
    borderRadius: UI_SIZES.elements.avatar.sm,
    height: UI_SIZES.elements.avatar.lg,
    width: UI_SIZES.elements.avatar.lg,
  },
  container: {
    borderRadius: UI_SIZES.radius.selector,
    padding: UI_SIZES.spacing.minor,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    padding: UI_SIZES.spacing.minor,
    borderRadius: UI_SIZES.radius.extraLarge,
    backgroundColor: theme.ui.background.card,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: UI_SIZES.spacing.small,
  },
});
