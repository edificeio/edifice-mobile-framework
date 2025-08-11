import { Platform, StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    gap: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  header: {
    height: UI_SIZES.elements.navbarHeight + Platform.select({ default: UI_SIZES.spacing.small, ios: UI_SIZES.spacing.big }),
  },
  headerBlur: { backgroundColor: theme.ui.overlay.bar, height: '100%' },
  headerTitle: {
    color: theme.ui.text.regular,
    paddingVertical: Platform.select({ default: UI_SIZES.spacing.small, ios: UI_SIZES.spacing.big }),
  },
  page: {
    flexShrink: 1,
  },
  welcomeNote: {
    backgroundColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.mediumPlus,
    gap: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },
  welcomeNoteTitle: {
    color: theme.palette.primary.regular,
  },
  welcomeNoteTitleContainer: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
  },
});
