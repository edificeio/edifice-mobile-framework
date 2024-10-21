import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  avatarContour: {
    borderColor: theme.ui.background.card,
    borderRadius: UI_SIZES.elements.avatar.lg / 2,
    borderWidth: UI_SIZES.border.small,
    height: UI_SIZES.elements.avatar.lg + UI_SIZES.border.small / 2,
    left: -UI_SIZES.border.small / 2,
    position: 'absolute',
    top: -UI_SIZES.border.small / 2,
    width: UI_SIZES.elements.avatar.lg + UI_SIZES.border.small / 2,
    zIndex: 1,
  },
  container: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.selector,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: UI_SIZES.spacing.minor,
  },
  iconButton: {
    backgroundColor: theme.ui.background.card,
    borderRadius: UI_SIZES.radius.extraLarge,
    padding: UI_SIZES.spacing.minor,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: UI_SIZES.spacing.small,
  },
});
