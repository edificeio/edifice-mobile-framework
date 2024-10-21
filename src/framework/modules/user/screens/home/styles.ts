import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  accountButton: {
    alignSelf: 'center',
    marginBottom: UI_SIZES.spacing.medium,
  },
  bottomRoundDecoration: {
    alignSelf: 'center',
    marginTop: UI_SIZES.spacing.medium,
  },
  logoutButton: {
    color: theme.palette.status.failure.regular,
    textAlign: 'center',
  },
  navBarSvgDecoration: {
    position: 'absolute',
  },
  page: {
    backgroundColor: theme.palette.grey.white,
  },
  section: {
    marginBottom: UI_SIZES.spacing.big,
    marginHorizontal: UI_SIZES.spacing.medium,
  },
  sectionBottom: {
    marginTop: UI_SIZES.spacing.large,
  },
  sectionLast: {
    marginBottom: 0,
  },
  sectionTitle: {
    color: theme.palette.grey.black,
    marginBottom: UI_SIZES.spacing.small,
  },
  sectionUserInfo: {
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.large,
    paddingTop: UI_SIZES.spacing.minor,
  },
  space: {
    backgroundColor: theme.palette.secondary.dark,
    borderRadius: UI_SIZES.radius.mediumPlus,
    marginBottom: UI_SIZES.spacing.large,
    marginHorizontal: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.medium,
  },
  spaceAnim: {
    height: 100,
    position: 'absolute',
    right: 0,
    top: -UI_SIZES.spacing.big,
    width: 100,
  },
  spaceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.huge,
    marginBottom: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing._LEGACY_tiny,
  },
  spaceBadgeText: {
    color: theme.palette.grey.white,
  },
  spaceSvg: {
    bottom: 0,
    position: 'absolute',
    right: 0,
  },
  spaceText: {
    color: theme.palette.grey.white,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  userInfoButton: {
    marginTop: UI_SIZES.spacing.medium,
  },
  userInfoName: {
    marginTop: UI_SIZES.spacing.medium,
    textAlign: 'center',
  },
  version: {
    color: theme.palette.grey.graphite,
    margin: UI_SIZES.spacing.medium,
    textAlign: 'center',
  },
});
