import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { PixelRatio, StyleSheet, Text } from 'react-native';

import { BaseTextArea } from './base';
import { useMaxLength } from './base.common';
import { chat } from './style';
import { ChatTextAreaProps } from './types';

import { UI_SIZES } from '~/framework/components/constants';

/**
 * Multi-line text edit stylized as a chat bubble.
 * @param props
 * @returns
 */
export const ChatTextArea = ({
  inputStyle: _inputStyle,
  maxLength,
  size = 'md',
  value,
  wrapperStyle,
  ...props
}: ChatTextAreaProps) => {
  const { isLimitReached, text: charCountText } = useMaxLength(value?.length ?? 0, maxLength);
  const aimHeight = UI_SIZES.elements.avatar[size];
  const fontScale = PixelRatio.getFontScale();

  const inputStyle = React.useMemo(() => StyleSheet.flatten([chat.input as typeof _inputStyle, _inputStyle]), [_inputStyle]);

  const charCountStyle = React.useMemo(
    () =>
      charCountText
        ? [
            chat.counter,
            isLimitReached ? chat.counterMax : undefined,
            { paddingBottom: (aimHeight - fontScale * (inputStyle.lineHeight ?? chat.input.lineHeight)) / 2 },
          ]
        : undefined,
    [aimHeight, charCountText, fontScale, inputStyle.lineHeight, isLimitReached],
  );
  return (
    <BaseTextArea
      aimHeight={aimHeight}
      inputStyle={inputStyle}
      maxLength={maxLength}
      value={value}
      wrapperStyle={React.useMemo(() => [chat.wrapper, wrapperStyle], [wrapperStyle])}
      {...props}>
      {charCountText && <Text style={charCountStyle}>{charCountText}</Text>}
    </BaseTextArea>
  );
};
