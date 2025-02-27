import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth } from '~/framework/components/constants';

export const INPUT_BUTTON_COLOR = theme.palette.grey.black;

export const styles = StyleSheet.create({
  imageInputContainer: {
    alignSelf: 'center',
  },
  moduleImageContainer: {
    borderRadius: 8,
    height: getScaleWidth(120),
    position: 'relative',
    width: getScaleWidth(120),
  },
});
