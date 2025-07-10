import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  badge: {
    marginLeft: UI_SIZES.spacing.tiny,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default styles;
