import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  acceptButton: {
    marginTop: UI_SIZES.spacing.large,
  },
  eulaImageContainer: {
    paddingHorizontal: UI_SIZES.spacing.big,
  },
  mustAccept: {
    marginTop: UI_SIZES.spacing.small,
    textAlign: 'center',
  },
  newEULALabel: {
    color: theme.palette.primary.regular,
    marginTop: UI_SIZES.spacing.large,
    textAlign: 'center',
  },
  newEULALink: {
    textDecorationLine: 'underline',
  },
  refuseButton: {
    color: theme.palette.status.failure.regular,
    textAlign: 'center',
  },
  refuseTouchable: {
    marginTop: UI_SIZES.spacing.big,
  },
});
