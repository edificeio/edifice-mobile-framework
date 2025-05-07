import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    left: UI_SIZES.spacing.medium,
    position: 'absolute',
    zIndex: 1,
  },
});

export default styles;
