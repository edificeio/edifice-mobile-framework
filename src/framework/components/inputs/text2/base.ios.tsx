import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { PixelRatio, StyleSheet, Text, TextInput, View } from 'react-native';

import { TextAreaDecoration } from './base.common';
import defaultStyles from './style';
import { BaseTextAreaProps, BaseTextInputProps } from './types';

/**
 * DISCLAIMER
 *
 * @see https://github.com/facebook/react-native/issues/46207
 *
 * React Native's TextInput is broken on iOS.
 * Cumulating `value` and `lineHeight` settings goes wrong, so this implementation is full of
 * little hacks to make things look ok. This is not perfect (autogrow grows too much) but fine enough.
 */

/**
 * Seems that iOS displays textInput with a reducer line-height, but still proportional to the given value.
 * This value compensates this strange behaviour and has been found
 * by measuring on screen the difference between <TextInput/> and <Text/> components with the same lineHeight value.
 */
export const IOS_TEXT_INPUT_LINE_HEIGHT_RATIO = 1.1475;

/**
 * Neutral component for one-line text input.
 * Has no styles by default. Given you own style with `style` and `textStyle` props, or use pre-stylized variants.
 *
 * @param props
 * @returns
 */
export const BaseTextInput = ({
  aimHeight: _aimHeight,
  inputStyle: _inputStyle,
  placeholder,
  placeholderTextColor,
  value,
  wrapperStyle: _wrapperStyle,
  ...props
}: BaseTextInputProps) => {
  const fontScale = PixelRatio.getFontScale();
  const wrapperStyle = React.useMemo(() => StyleSheet.flatten([defaultStyles.wrapper, _wrapperStyle]), [_wrapperStyle]);

  const { lineHeight = defaultStyles.input.lineHeight, ...intermediate } = React.useMemo(
    () => StyleSheet.flatten([defaultStyles.input as typeof _inputStyle, _inputStyle]),
    [_inputStyle],
  );
  const borderWidth = wrapperStyle.borderWidth ?? 0;
  const aimHeight = _aimHeight - borderWidth * 2;
  const paddingVertical = (aimHeight - fontScale * lineHeight * IOS_TEXT_INPUT_LINE_HEIGHT_RATIO) / 2;
  const height = lineHeight * fontScale + (aimHeight - fontScale * lineHeight);

  const inputStyle = React.useMemo(() => {
    return [
      intermediate,
      {
        height,

        // Note: on one-line inputs, iOS need to have undefined lineHeight to layout properly.
        lineHeight: undefined,
        paddingVertical,
      },
    ];
  }, [height, intermediate, paddingVertical]);

  const placeholderStyle = React.useMemo(
    () =>
      placeholder
        ? [
            defaultStyles.placeholder,
            placeholderTextColor ? { color: placeholderTextColor } : undefined,
            {
              height,
              lineHeight,
              paddingVertical: (aimHeight - fontScale * lineHeight) / 2,
            },
          ]
        : undefined,
    [aimHeight, fontScale, height, lineHeight, placeholder, placeholderTextColor],
  );

  return (
    <View style={wrapperStyle}>
      <TextInput value={value} style={inputStyle} aria-label={placeholder} {...props} />
      {placeholder && !value && <Text style={placeholderStyle}>{placeholder}</Text>}
    </View>
  );
};

/**
 * Neutral component for multi-line text input.
 * Height ajust automatically between a min and a max number of lines
 * Has no styles by default. Given you own style with `style` and `textStyle` props, or use pre-stylized variants.
 *
 * @param props
 * @returns
 */
export const BaseTextArea = ({
  aimHeight: _aimHeight,
  children,
  inputStyle: _inputStyle,
  maxLength,
  maxLines = 5,
  minLines = 1,
  onContentSizeChange: _onContentSizeChange,
  placeholder,
  placeholderTextColor,
  value,
  wrapperStyle: _wrapperStyle,
  ...props
}: BaseTextAreaProps) => {
  const fontScale = PixelRatio.getFontScale();
  const wrapperStyle = React.useMemo(() => StyleSheet.flatten([defaultStyles.wrapper, _wrapperStyle]), [_wrapperStyle]);

  const {
    fontSize = defaultStyles.input.fontSize,
    lineHeight = defaultStyles.input.lineHeight,
    ...intermediate
  } = React.useMemo(() => StyleSheet.flatten([defaultStyles.input as typeof _inputStyle, _inputStyle]), [_inputStyle]);
  const borderWidth = wrapperStyle.borderWidth ?? 0;
  const aimHeight = _aimHeight - borderWidth * 2;
  const paddingVertical = (aimHeight - fontScale * lineHeight * IOS_TEXT_INPUT_LINE_HEIGHT_RATIO) / 2;
  const minHeight = paddingVertical * 2 + lineHeight * fontScale * minLines;
  const maxHeight = paddingVertical * 2 + lineHeight * fontScale * maxLines;

  const inputStyle = React.useMemo(() => {
    return [
      intermediate,
      {
        fontSize,
        lineHeight: lineHeight * IOS_TEXT_INPUT_LINE_HEIGHT_RATIO,
        maxHeight,
        minHeight,
        paddingVertical,
      },
    ];
  }, [fontSize, intermediate, lineHeight, maxHeight, minHeight, paddingVertical]);

  const placeholderStyle = React.useMemo(
    () =>
      placeholder
        ? [
            defaultStyles.placeholder,
            placeholderTextColor ? { color: placeholderTextColor } : undefined,
            {
              lineHeight: lineHeight,
              minHeight,
              paddingVertical: (aimHeight - fontScale * lineHeight) / 2,
            },
          ]
        : undefined,
    [aimHeight, fontScale, lineHeight, minHeight, placeholder, placeholderTextColor],
  );

  return (
    <View style={wrapperStyle}>
      <View>
        <TextInput value={value} maxLength={maxLength} multiline style={inputStyle} aria-label={placeholder} {...props} />
        {wrapperStyle.backgroundColor && <TextAreaDecoration color={wrapperStyle.backgroundColor} />}
      </View>
      {placeholder && !value && <Text style={placeholderStyle}>{placeholder}</Text>}
      {children}
    </View>
  );
};
