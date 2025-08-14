import { I18nManager, StyleSheet } from 'react-native';

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
  tileUnavailable: {
    backgroundColor: theme.palette.grey.pearl,
  },
});

export default StyleSheet.create({
  backButtonImage: {
    // custom iOS back button to ensure that perfect match with the native one
    height: 21, // value provided by react navigation
    marginRight: getScaleWidth(1), // Fix for the eye to visually center the rafter
    resizeMode: 'contain',
    tintColor: theme.ui.text.regular,
    transform: [{ scaleX: I18nManager.getConstants().isRTL ? -1 : 1 }],
    width: 13, // value provided by react navigation
  },
  largeTileIcon: {
    backgroundColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.newCard,
    padding: UI_SIZES.spacing.minor,
  },
  navBarButton: {
    alignItems: 'center',
    backgroundColor: theme.ui.background.card,
    borderRadius: UI_SIZES.radius.medium,
    height: UI_SIZES.elements.icon.xlarge,
    justifyContent: 'center',
    left: -4, // compensate native placement of back icon. This value is not scaled by the UI.
    position: 'absolute',
    width: UI_SIZES.elements.icon.xlarge,
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
  titleHeaderInner: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.elements.navbarIconSize + 2 * UI_SIZES.elements.navbarMargin,
    paddingTop: UI_SIZES.border.small,
  },
  titleHeaderWrapper: {
    alignItems: 'stretch',
    backgroundColor: theme.ui.background.card,
    borderBottomColor: theme.palette.grey.cloudy,
    borderBottomWidth: UI_SIZES.border.thin,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
