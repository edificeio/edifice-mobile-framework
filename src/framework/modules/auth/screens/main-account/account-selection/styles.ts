import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  addAccount: {
    alignItems: 'center',
    padding: UI_SIZES.spacing.minor,
  },
  addAccountRound: {
    alignItems: 'center',
    borderColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.huge,
    borderWidth: UI_SIZES.border.small,
    height: getScaleWidth(88),
    justifyContent: 'center',
    marginBottom: UI_SIZES.spacing.medium,
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
    alignItems: 'center',
    marginVertical: UI_SIZES.spacing.big,
  },
  topContainer: {
    alignItems: 'center',
  },
});
