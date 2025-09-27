import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  text: {
    flex: 1,
    marginLeft: UI_SIZES.spacing.minor,
  },
  textNoIcon: {
    flex: 1,
    marginLeft: 0,
  },
});
