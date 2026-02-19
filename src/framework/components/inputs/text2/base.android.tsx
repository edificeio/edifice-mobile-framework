import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { PixelRatio, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { TextAreaDecoration } from './base.common';
import defaultStyles from './style';
import { BaseTextAreaProps, BaseTextInputProps } from './types';

/**
 * DISCLAIMER
 *
 * React Native's TextInput is broken on Android.
 * Padding crop content in scrollable TextInput, so we use an external ScrollView to handle this.
 * Height is manually calculated as automatic sizing by the OS is completely broken.
 */

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
  const borderWidth = wrapperStyle.borderWidth ?? 0;
  const aimHeight = _aimHeight - borderWidth * 2;
  const { lineHeight = defaultStyles.input.lineHeight, ...intermediate } = React.useMemo(
    () => StyleSheet.flatten([defaultStyles.input as typeof _inputStyle, _inputStyle]),
    [_inputStyle],
  );
  const height = lineHeight * fontScale + (aimHeight - fontScale * lineHeight);
  const paddingVertical = (aimHeight - fontScale * lineHeight) / 2;

  const inputStyle = React.useMemo(() => {
    return [
      intermediate,
      {
        height,
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
      {placeholder && !value && (
        <Text style={placeholderStyle} numberOfLines={1}>
          {placeholder}
        </Text>
      )}
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

  const {
    backgroundColor = 'transparent',
    borderColor,
    borderRadius,
    borderWidth = 0,
    ...intermediateWrapperStyle
  } = React.useMemo(() => StyleSheet.flatten([defaultStyles.wrapper as typeof _wrapperStyle, _wrapperStyle]), [_wrapperStyle]);

  const { lineHeight = defaultStyles.input.lineHeight, ...intermediateInputStyle } = React.useMemo(
    () => StyleSheet.flatten([defaultStyles.input as typeof _inputStyle, _inputStyle]),
    [_inputStyle],
  );

  const [contentLines, setContentLines] = React.useState(0);
  const aimHeight = _aimHeight - borderWidth * 2;
  const height =
    lineHeight * fontScale * Math.max(minLines, Math.min(maxLines, contentLines)) + (aimHeight - fontScale * lineHeight);
  const paddingVertical = (aimHeight - fontScale * lineHeight) / 2;

  const onContentSizeChange = React.useCallback<NonNullable<TextInputProps['onContentSizeChange']>>(
    e => {
      const lines =
        !value || value.length === 0
          ? 1
          : Math.ceil((e.nativeEvent.contentSize.height - 2 * paddingVertical) / (fontScale * lineHeight));
      setContentLines(lines);
      _onContentSizeChange?.(e);
    },
    [_onContentSizeChange, fontScale, lineHeight, paddingVertical, value],
  );

  const inputStyle = React.useMemo(() => {
    return [
      intermediateInputStyle,
      {
        flex: 0,
        lineHeight: lineHeight,
        padding: 0,
        paddingVertical,
      },
    ];
  }, [intermediateInputStyle, lineHeight, paddingVertical]);

  const scrollContentStyle = React.useMemo(() => {
    return [
      {
        backgroundColor,
        borderWidth: 0,
        flex: 0,
        padding: 0,
      },
    ];
  }, [backgroundColor]);
  const minHeight = paddingVertical * 2 + lineHeight * fontScale * minLines;
  const maxHeight = paddingVertical * 2 + lineHeight * fontScale * maxLines;
  const scrollStyle = React.useMemo(() => {
    return [
      {
        flex: 0,
        height: contentLines <= 1 ? aimHeight : height,
        maxHeight,
        minHeight,
      },
    ];
  }, [aimHeight, contentLines, height, maxHeight, minHeight]);

  const placeholderStyle = React.useMemo(
    () =>
      placeholder
        ? [
            defaultStyles.placeholder,
            placeholderTextColor ? { color: placeholderTextColor } : undefined,
            {
              lineHeight,
              minHeight,
              paddingVertical,
            },
          ]
        : undefined,
    [lineHeight, minHeight, paddingVertical, placeholder, placeholderTextColor],
  );

  const wrapperStyle = React.useMemo(
    () => [
      defaultStyles.wrapper,
      intermediateWrapperStyle,
      {
        backgroundColor,
        borderColor,
        borderRadius,
        borderWidth,
        flex: 1,
      },
    ],
    [backgroundColor, borderColor, borderRadius, borderWidth, intermediateWrapperStyle],
  );

  return (
    <View style={wrapperStyle}>
      <View>
        <ScrollView
          style={scrollStyle}
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={contentLines > maxLines}>
          <TextInput
            value={value}
            multiline
            style={inputStyle}
            aria-label={placeholder}
            {...props}
            onContentSizeChange={onContentSizeChange}
          />
        </ScrollView>
        {backgroundColor && <TextAreaDecoration color={backgroundColor} />}
      </View>
      {children}
      {placeholder && !value && <Text style={placeholderStyle}>{placeholder}</Text>}
    </View>
  );
};
