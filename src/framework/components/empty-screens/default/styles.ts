import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  icon: {
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginTop: UI_SIZES.spacing.large,
  },
  text: {
    textAlign: 'center',
    marginTop: UI_SIZES.spacing.small,
  },
});
