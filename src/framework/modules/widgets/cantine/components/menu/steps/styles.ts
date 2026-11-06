import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

// styles of the placeholder, the steps themselves are styled by the stepper.
export default StyleSheet.create({
  content: {
    flex: 1,
    gap: UI_SIZES.spacing.minor,
    paddingBottom: UI_SIZES.spacing.medium,
  },
  dish: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: TextSizeStyle.Medium.lineHeight,
  },
  dot: {
    height: UI_SIZES.elements.icon.mediumlarge,
    width: UI_SIZES.elements.icon.mediumlarge,
  },
  label: {
    height: UI_SIZES.elements.icon.xsmall,
    width: UI_SIZES.elements.icon.xsmall,
  },
  line: {
    borderRadius: 0,
    flex: 1,
    width: UI_SIZES.border.small,
  },
  step: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
  },
  title: {
    height: UI_SIZES.elements.icon.xsmall,
    marginVertical: (UI_SIZES.elements.icon.mediumlarge - UI_SIZES.elements.icon.xsmall) / 2,
  },
  track: {
    alignItems: 'center',
  },
});
