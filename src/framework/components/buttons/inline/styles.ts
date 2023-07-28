import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  inlineButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: undefined,
    borderWidth: 0,
    flexDirection: 'row-reverse',
  },
  picture: {
    marginLeft: 0,
    marginRight: UI_SIZES.spacing.minor,
  },
});
