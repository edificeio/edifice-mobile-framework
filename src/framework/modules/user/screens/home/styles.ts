import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';

export default StyleSheet.create({
  page: {
    backgroundColor: theme.palette.grey.white,
  },
  section: {
    marginHorizontal: UI_SIZES.spacing.medium,
    marginBottom: UI_SIZES.spacing.big,
  },
  sectionTitle: {
    color: theme.palette.grey.black,
    marginBottom: UI_SIZES.spacing.small,
  },
  sectionBottom: {
    marginVertical: UI_SIZES.spacing.large,
  },
  sectionUserInfo: {
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.large,
    paddingTop: UI_SIZES.spacing.minor,
  },
  logoutButton: {
    color: theme.palette.status.failure.regular,
    textAlign: 'center',
  },
  versionButton: {
    color: theme.palette.grey.graphite,
    textAlign: 'center',
  },
  navBarSvgDecoration: {
    position: 'absolute',
  },
  userInfoButton: {
    marginTop: UI_SIZES.spacing.medium,
  },
  userInfoName: {
    marginTop: UI_SIZES.spacing.medium,
  },
  userInfoType: {
    color: theme.ui.text.light,
  },
});
