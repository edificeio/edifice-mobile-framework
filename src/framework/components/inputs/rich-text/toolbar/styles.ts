import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  closeUnderMenu: {
    alignItems: 'center',
    backgroundColor: theme.palette.primary.pale,
    flexDirection: 'row',
    height: '100%',
    paddingHorizontal: UI_SIZES.spacing.minor,
  },
  closeUnderMenuCross: {
    backgroundColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.huge,
    marginRight: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.tiny,
  },
  container: {
    borderColor: theme.palette.grey.cloudy,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default styles;
