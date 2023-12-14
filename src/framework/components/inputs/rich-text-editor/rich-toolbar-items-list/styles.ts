import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  list: {
    alignItems: 'center',
    paddingHorizontal: UI_SIZES.spacing.tiny,
  },
  separator: {
    width: UI_SIZES.spacing.tiny,
  },
});

export default styles;
