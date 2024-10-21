import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const BORDER_WIDTH = 1;
const BORDER_RADIUS = 12;

export default StyleSheet.create({
  arrow: {
    position: 'absolute',
    right: UI_SIZES.spacing.small,
  },
  container: {
    alignItems: 'center',
    backgroundColor: theme.ui.background.card,
    borderBottomWidth: BORDER_WIDTH,
    borderColor: theme.palette.grey.cloudy,
    borderLeftWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderTopWidth: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: UI_SIZES.spacing.medium,
  },
  containerAlone: {
    borderBottomLeftRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS,
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    borderTopWidth: BORDER_WIDTH,
  },
  containerFirst: {
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    borderTopWidth: BORDER_WIDTH,
  },
  containerLast: {
    borderBottomLeftRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS,
    borderTopWidth: 0,
  },
  icon: {
    marginRight: UI_SIZES.spacing.minor,
  },
  iconText: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: UI_SIZES.dimensions.width.mediumPlus,
  },
  text: {
    flex: 1,
  },
});
