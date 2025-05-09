import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    zIndex: 1,
  },
  iconClear: {
    right: UI_SIZES.spacing.small,
  },
  iconSearch: {
    left: UI_SIZES.spacing.small,
  },
  input: {
    paddingVertical: UI_SIZES.spacing.tiny,
  },
});

export default styles;
