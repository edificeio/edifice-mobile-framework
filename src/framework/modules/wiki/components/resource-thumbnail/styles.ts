import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  resourceThumbnailContainer: {
    alignSelf: 'center',
    borderColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.elements.border.large,
    height: UI_SIZES.elements.image.medium,
    width: UI_SIZES.elements.image.medium,
  },
});
