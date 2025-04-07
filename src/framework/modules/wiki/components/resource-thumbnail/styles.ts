import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  resourceThumbnailContainer: {
    alignSelf: 'center',
    borderColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.mediumPlus + UI_SIZES.elements.border.large,
    borderWidth: UI_SIZES.elements.border.large,
    height: UI_SIZES.elements.image.medium + UI_SIZES.elements.border.large * 2,
    width: UI_SIZES.elements.image.medium + UI_SIZES.elements.border.large * 2,
  },
});
