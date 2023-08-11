import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  commonView: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: UI_SIZES.spacing.tiny,
  },
  iconLeft: {
    marginRight: UI_SIZES.spacing.minor,
  },
  iconRight: {
    marginLeft: UI_SIZES.spacing.minor,
  },
  indicator: {
    height: TextSizeStyle.Normal.lineHeight,
  },
});
