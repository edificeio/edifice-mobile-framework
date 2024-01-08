import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  actionContainer: {
    backgroundColor: theme.palette.secondary.regular,
    borderColor: theme.palette.secondary.regular,
  },
  backgroundImage: {
    position: 'absolute',
    right: -UI_SIZES.spacing.major,
    bottom: 80,
    maxHeight: 300,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: UI_SIZES.spacing.big,
    rowGap: UI_SIZES.spacing.medium,
  },
  primaryText: {
    textAlign: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  secondaryText: {
    marginLeft: UI_SIZES.spacing.minor,
  },
});
