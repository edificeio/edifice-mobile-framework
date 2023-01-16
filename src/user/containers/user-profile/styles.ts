import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  page: {
    backgroundColor: theme.palette.grey.white,
  },
  main: {
    flex: 1,
  },
  svgHeader: {
    position: 'absolute',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.large,
    marginTop: UI_SIZES.spacing.tiny,
  },
  userInfo_name: {
    marginTop: UI_SIZES.spacing.medium,
  },
  userInfo_type: {
    color: theme.ui.text.light,
  },
  userInfo_button: {
    marginTop: UI_SIZES.spacing.medium,
  },
  section: {
    marginHorizontal: UI_SIZES.spacing.medium,
    marginBottom: UI_SIZES.spacing.big,
  },
  sectionLast: {
    marginBottom: 0,
  },
  linkDisconnect: {
    color: theme.palette.status.failure.regular,
    textAlign: 'center',
  },
  boxBottomPage: {
    marginVertical: UI_SIZES.spacing.large,
  },
  textVersion: {
    color: theme.palette.grey.graphite,
    textAlign: 'center',
  },
  titleSection: {
    color: theme.palette.grey.black,
    marginBottom: UI_SIZES.spacing.small,
  },
});
