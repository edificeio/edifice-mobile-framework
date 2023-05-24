import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const BORDER_WIDTH = 1;
const BORDER_RADIUS = 16;

export default StyleSheet.create({
  lineButtonText: {
    flex: 1,
    color: theme.ui.text.regular,
    paddingRight: UI_SIZES.spacing.minor,
  },
  lineButtonIcon: {
    transform: [{ rotate: '270deg' }],
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: theme.ui.background.card,
    borderLeftWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderBottomWidth: BORDER_WIDTH,
    borderTopWidth: 0,
    borderColor: theme.palette.grey.cloudy,
    justifyContent: 'flex-start',
    padding: UI_SIZES.spacing.medium,
  },
  containerAlone: {
    borderTopWidth: BORDER_WIDTH,
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    borderBottomLeftRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS,
  },
  containerFirst: {
    borderTopWidth: BORDER_WIDTH,
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
  },
  containerLast: {
    borderTopWidth: 0,
    borderBottomLeftRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS,
  },
});
