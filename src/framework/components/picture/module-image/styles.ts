import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  imageLoader: {
    height: '100%',
    width: '100%',
  },
  imageLoaderWrapper: {
    position: 'absolute',
  },
  moduleImage: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.medium,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  moduleImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
