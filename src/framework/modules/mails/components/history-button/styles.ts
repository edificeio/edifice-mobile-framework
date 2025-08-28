import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    marginBottom: UI_SIZES.spacing.minor,
  },
  container: {
    marginVertical: UI_SIZES.spacing.big,
  },
});
