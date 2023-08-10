import { StyleSheet } from 'react-native';
import { TextSizeStyle } from '~/framework/components/text';

export default StyleSheet.create({
  multilineInput: {
    textAlignVertical: 'top',
    ...TextSizeStyle.Medium,
  },
});
