import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  bottomSheetPaddingBottom: {
    paddingBottom: UI_SIZES.spacing.big,
  },
  closeButton: {
    padding: UI_SIZES.spacing.minor,
  },
  container: {
    gap: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.minor,
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
