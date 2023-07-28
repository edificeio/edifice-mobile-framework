import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const BORDER_WIDTH = 1;
const BORDER_RADIUS = 8;

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    borderLeftWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderBottomWidth: BORDER_WIDTH,
    borderTopWidth: 0,
    borderColor: theme.palette.grey.cloudy,
    justifyContent: 'space-between',
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
    position: 'relative',
  },
  iconText: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: UI_SIZES.dimensions.width.mediumPlus,
  },
  text: {
    flex: 1,
  },
  icon: {
    marginRight: UI_SIZES.spacing.minor,
  },
  arrow: {
    position: 'absolute',
    right: UI_SIZES.spacing.small,
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
