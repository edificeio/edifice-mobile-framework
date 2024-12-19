import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  buttonView: {
    alignSelf: 'flex-start',
  },
  flex1: {
    flex: 1,
  },
  reactions: {
    alignSelf: 'flex-start',
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.border.thin,
    elevation: 16,
    flexDirection: 'row',
    left: 0,
    position: 'absolute',
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  reactionsIcon: {
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.medium,
  },
  reactionsText: {
    color: theme.palette.grey.white,
    textAlign: 'center',
  },
  reactionsTextView: {
    backgroundColor: theme.palette.grey.black,
    borderRadius: UI_SIZES.radius.medium,
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing._LEGACY_tiny,
    position: 'absolute',
    top: -30,
  },
});

export default styles;
