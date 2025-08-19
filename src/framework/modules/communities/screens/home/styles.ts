import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

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
  tileUnavailable: {
    backgroundColor: theme.palette.grey.pearl,
  },
});

export default StyleSheet.create({
  largeTileIcon: {
    backgroundColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.newCard,
    padding: UI_SIZES.spacing.minor,
  },
  page: {
    gap: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingVertical: UI_SIZES.spacing.medium,
  },
  pill: {
    backgroundColor: theme.palette.grey.stone,
    borderRadius: UI_SIZES.radius.large,
    color: theme.ui.text.inverse,
    paddingHorizontal: UI_SIZES.spacing.minor,
  },
  tileCaption: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
  },
  tileCaptionDescriptionAvailable: {
    color: theme.palette.grey.graphite,
  },
  tileCaptionTextAvailable: {
    color: theme.palette.primary.regular,
  },
  tileCaptionTextUnavailable: {
    color: theme.palette.grey.graphite,
  },
  tileConversation: {
    ...baseStyles.tileBase,
    ...baseStyles.tileUnavailable,
    gap: UI_SIZES.spacing.minor,
  },
  tileCourses: {
    ...baseStyles.tileBase,
    ...baseStyles.tileUnavailable,
    gap: UI_SIZES.spacing.minor,
  },
  tileDocuments: {
    ...baseStyles.tileBase,
    ...baseStyles.tileAvailable,
    justifyContent: 'space-between',
  },
  tileMembers: {
    ...baseStyles.tileBase,
    ...baseStyles.tileAvailable,
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.medium,
  },
  tilesCol: {
    flex: 1,
    gap: UI_SIZES.spacing.minor,
  },
  tilesRow: {
    flex: 1,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
  },
});
