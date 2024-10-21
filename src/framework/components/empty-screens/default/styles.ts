import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  icon: {
    alignSelf: 'center',
  },
  text: {
    marginTop: UI_SIZES.spacing.small,
    textAlign: 'center',
  },
  title: {
    marginTop: UI_SIZES.spacing.large,
    textAlign: 'center',
  },
});
