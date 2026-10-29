import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  fallback: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.medium,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  placeholder: {
    height: '100%',
    width: '100%',
  },
  placeholderWrapper: {
    position: 'absolute',
  },
});
