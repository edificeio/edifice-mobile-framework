import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const INPUT_BUTTON_COLOR = theme.palette.grey.black;

export const styles = StyleSheet.create({
  imageInputContainer: {
    alignSelf: 'center',
  },
  moduleImageContainer: {
    borderRadius: UI_SIZES.radius.medium,
    height: UI_SIZES.elements.image.medium,
    position: 'relative',
    width: UI_SIZES.elements.image.medium,
  },
});
