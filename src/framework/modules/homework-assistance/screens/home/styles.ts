import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  actionContainer: {
    backgroundColor: theme.palette.secondary.regular,
    borderColor: theme.palette.secondary.regular,
  },
  backgroundImage: {
    bottom: 80,
    maxHeight: 300,
    position: 'absolute',
    right: -UI_SIZES.spacing.major,
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
    alignItems: 'center',
    flexDirection: 'row',
    height: 40,
  },
  secondaryText: {
    marginLeft: UI_SIZES.spacing.minor,
  },
});
