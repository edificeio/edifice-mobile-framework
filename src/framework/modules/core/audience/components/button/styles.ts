import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  flex1: {
    flex: 1,
  },
  reactions: {
    borderColor: theme.palette.grey.cloudy,
    borderWidth: UI_SIZES.border.thin,
    borderRadius: UI_SIZES.radius.medium,
    padding: UI_SIZES.spacing.medium,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    columnGap: UI_SIZES.spacing.big,
    position: 'absolute',
    backgroundColor: theme.palette.grey.white,
    shadowColor: theme.ui.shadowColor,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 16,
  },
});

export default styles;
