import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { cardShadow } from '~/framework/components/card/base';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.medium,
    flexDirection: 'row',
    height: UI_SIZES.dimensions.height.huge,
    justifyContent: 'space-between',
    marginBottom: UI_SIZES.spacing.tiny,
    marginLeft: UI_SIZES.spacing.medium,
    marginRight: UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.spacing.small,
    marginVertical: UI_SIZES.spacing.tiny,
    paddingHorizontal: UI_SIZES.spacing.medium,
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
