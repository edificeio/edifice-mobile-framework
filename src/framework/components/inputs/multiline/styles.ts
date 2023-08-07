import { StyleSheet } from 'react-native';

import { UI_SIZES, getScaleFontSize } from '~/framework/components/constants';

export default StyleSheet.create({
  multilineInputView: {
    paddingVertical: UI_SIZES.spacing.small,
  },
  multilineInput: {
    lineHeight: getScaleFontSize(24),
    textAlignVertical: 'top',
    paddingTop: 0,
  },
});
