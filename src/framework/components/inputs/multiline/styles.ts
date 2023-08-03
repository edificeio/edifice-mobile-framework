import { StyleSheet } from 'react-native';

import { UI_SIZES, getScaleFontSize } from '~/framework/components/constants';

export default StyleSheet.create({
  multilineInput: {
    paddingTop: UI_SIZES.spacing.small,
    paddingBottom: UI_SIZES.spacing.small,
    lineHeight: getScaleFontSize(24),
    textAlignVertical: 'top',
  },
});
