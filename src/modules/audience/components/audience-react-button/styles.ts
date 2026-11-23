import { StyleSheet } from 'react-native';

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
});

export default styles;
