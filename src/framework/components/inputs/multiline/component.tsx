import React, { forwardRef } from 'react';
import { Platform, TextInput as RNTextInput } from 'react-native';

import TextInput from '~/framework/components/inputs/text';
import { MultilineTextInputProps } from './types';

import styles from './styles';

const MultilineTextInput = forwardRef<RNTextInput, MultilineTextInputProps>((props: MultilineTextInputProps, ref) => {
  const { numberOfLines } = props;
  const [contentNumberOfLines, setContentNumberOfLines] = React.useState(1);
  let heightInput: number | undefined = styles.multilineInput.lineHeight * numberOfLines + 2 * styles.multilineInput.paddingTop;
  if (contentNumberOfLines > numberOfLines) heightInput = undefined;

  return (
    <TextInput
      {...props}
      multiline
      onContentSizeChange={e => {
        const contentHeight = e.nativeEvent.contentSize.height;
        const contentNumberOfLines = contentHeight / styles.multilineInput.lineHeight;
        setContentNumberOfLines(contentNumberOfLines);
      }}
      numberOfLines={Platform.OS === 'ios' ? undefined : numberOfLines}
      style={[styles.multilineInput, { height: Platform.OS === 'ios' ? heightInput : undefined }]}
      ref={ref}
    />
  );
});

export default MultilineTextInput;
