import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  commonView: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: UI_SIZES.radius.extraLarge,
    borderWidth: UI_SIZES.elements.border.default,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.minor,
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
