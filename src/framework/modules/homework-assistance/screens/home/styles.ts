import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { BUTTON_WIDTH } from '~/framework/modules/homework-assistance/components/feedback-menu/button/styles';

export default StyleSheet.create({
  actionContainer: {
    backgroundColor: theme.palette.secondary.regular,
    borderColor: theme.palette.secondary.regular,
  },
  backgroundImage: {
    bottom: 80,
    maxHeight: 300,
    opacity: 0.8,
    position: 'absolute',
    right: -UI_SIZES.spacing.major,
  },
  configContainer: {
    padding: UI_SIZES.spacing.big,
    rowGap: UI_SIZES.spacing.medium,
  },
  container: {
    rowGap: UI_SIZES.spacing.medium,
  },
  containerPadding: {
    paddingBottom: BUTTON_WIDTH + UI_SIZES.spacing.minor,
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
