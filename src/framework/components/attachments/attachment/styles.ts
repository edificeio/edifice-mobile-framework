import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

// action icon size + paddingHorizontal
const SEPARATOR_HEIGHT = UI_SIZES.elements.icon.small + 2 * UI_SIZES.spacing.tiny;

export default StyleSheet.create({
  button: {
    padding: UI_SIZES.spacing.tiny,
  },
  container: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.border.thin,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  separator: {
    backgroundColor: theme.palette.grey.cloudy,
    height: SEPARATOR_HEIGHT,
    marginHorizontal: UI_SIZES.spacing.small,
    width: UI_SIZES.border.thin,
  },
  text: {
    flexShrink: 1,
    marginLeft: UI_SIZES.spacing.minor,
  },
});
