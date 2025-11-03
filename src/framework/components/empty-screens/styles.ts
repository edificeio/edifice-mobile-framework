import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: UI_SIZES.spacing.medium,
  },
  illustration: {
    maxHeight: UI_SIZES.elements.image.medium,
    maxWidth: UI_SIZES.elements.image.large,
    objectFit: 'contain',
  },
  text: {
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
    gap: UI_SIZES.spacing.tiny,
  },
  title: {
    color: theme.palette.primary.regular,
    textAlign: 'center',
  },
});
