import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';

export default StyleSheet.create({
  addAccount: {
    padding: UI_SIZES.spacing.minor,
    alignItems: 'center',
  },
  addAccountRound: {
    borderWidth: UI_SIZES.border.small,
    borderColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.huge,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: UI_SIZES.spacing.medium,
    height: getScaleWidth(88),
    width: getScaleWidth(88),
  },
  addAccountText: {
    color: theme.palette.primary.regular,
  },

  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: UI_SIZES.spacing.large,
  },
  button: {
    marginBottom: UI_SIZES.spacing.minor,
  },
  description: {
    color: theme.palette.grey.graphite,
  },
  page: {
    paddingVertical: UI_SIZES.spacing.big,
    // paddingHorizontal: UI_SIZES.spacing.large,
  },
  textContainer: {
    marginVertical: UI_SIZES.spacing.big,
    alignItems: 'center',
  },
  topContainer: {
    alignItems: 'center',
  },
});
