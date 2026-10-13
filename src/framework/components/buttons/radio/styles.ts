import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.tiny,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  disabledLabelText: {
    color: theme.palette.grey.grey,
  },
  iconContainer: {
    // A circle: half the halo, taken on the smaller size since both share this style.
    borderRadius: (UI_SIZES.elements.radio.small + 2 * UI_SIZES.spacing.tiny) / 2,
    // Android only honours the radius when it has to clip to it.
    overflow: 'hidden',
    padding: UI_SIZES.spacing.tiny,
  },
  iconPressedContainer: {
    backgroundColor: theme.ui.radio.highlight,
  },
  labelText: {
    flexShrink: 1,
  },
});
