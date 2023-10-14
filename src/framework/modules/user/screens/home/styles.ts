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
    marginHorizontal: UI_SIZES.spacing.medium,
    marginBottom: UI_SIZES.spacing.big,
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
  toggleKeysButton: {
    marginTop: UI_SIZES.spacing.medium,
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
    textAlign: 'center',
    marginTop: UI_SIZES.spacing.medium,
  },
});
