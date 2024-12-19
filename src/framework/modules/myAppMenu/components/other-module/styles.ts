import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { cardShadow } from '~/framework/components/card/base';
import { UI_SIZES } from '~/framework/components/constants';

export const BUTTON_ICON_SIZE = UI_SIZES.elements.icon.small;

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: UI_SIZES.spacing.tiny,
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.tiny,
    ...cardShadow,
  },
  imagePicture: {
    height: UI_SIZES.elements.icon.xlarge,
    objectFit: 'contain',
    width: UI_SIZES.elements.icon.xlarge,
  },
  infos: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
    flexDirection: 'row',
  },
});
