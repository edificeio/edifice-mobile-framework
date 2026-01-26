import React from 'react';
import { PixelRatio, ScrollView, StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { TextAreaDecoration } from './base.common';
import defaultStyles from './style';
import { BaseTextAreaProps, BaseTextInputProps } from './types';

import { UI_STYLES } from '~/framework/components/constants';

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
 * Neutral component for one-line text input.
 * Has no styles by default. Given you own style with `style` and `textStyle` props, or use pre-stylized variants.
 *
 * @param props
 * @returns
 */
export const BaseTextInput = ({
  aimHeight: _aimHeight,
  inputStyle: _inputStyle,
  wrapperStyle: _wrapperStyle,
  ...props
}: BaseTextInputProps) => {
  const fontScale = PixelRatio.getFontScale();
  const wrapperStyle = React.useMemo(() => StyleSheet.flatten([defaultStyles.wrapper, _wrapperStyle]), [_wrapperStyle]);

  const inputStyle = React.useMemo(() => {
    const { lineHeight = defaultStyles.input.lineHeight, ...intermediate } = StyleSheet.flatten([
      defaultStyles.input as typeof _inputStyle,
      _inputStyle,
    ]);
    const borderWidth = wrapperStyle.borderWidth ?? 0;
    const aimHeight = _aimHeight - borderWidth * 2;
    const height = lineHeight * fontScale + (aimHeight - fontScale * lineHeight);
    const paddingVertical = (aimHeight - fontScale * lineHeight) / 2;

    return [
      intermediate,
      {
        height,
        paddingVertical,
      },
    ];
  }, [_aimHeight, _inputStyle, fontScale, wrapperStyle.borderWidth]);

  return (
    <View style={wrapperStyle}>
      <TextInput style={inputStyle} {...props} />
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
  wrapperStyle: _wrapperStyle,
  ...props
}: BaseTextAreaProps) => {
  const fontScale = PixelRatio.getFontScale();

  const {
    backgroundColor = 'transparent',
    borderWidth = 0,
    ...intermediateWrapperStyle
  } = React.useMemo(() => StyleSheet.flatten([defaultStyles.wrapper as typeof _wrapperStyle, _wrapperStyle]), [_wrapperStyle]);

  const { lineHeight = defaultStyles.input.lineHeight, ...intermediateInputStyme } = React.useMemo(
    () => StyleSheet.flatten([defaultStyles.input as typeof _inputStyle, _inputStyle]),
    [_inputStyle],
  );

  const [contentLines, setContentLines] = React.useState(0);
  const onContentSizeChange = React.useCallback<NonNullable<TextInputProps['onContentSizeChange']>>(
    e => {
      const lines = Math.ceil(e.nativeEvent.contentSize.height / (fontScale * lineHeight));
      setContentLines(lines);
      _onContentSizeChange?.(e);
    },
    [_onContentSizeChange, fontScale, lineHeight],
  );

  const aimHeight = _aimHeight - borderWidth * 2;
  const height =
    lineHeight * fontScale * Math.max(minLines, Math.min(maxLines, contentLines)) + (aimHeight - fontScale * lineHeight);

  const inputStyle = React.useMemo(() => {
    return [
      intermediateInputStyme,
      {
        lineHeight: lineHeight,
        padding: 0,
      },
    ];
  }, [intermediateInputStyme, lineHeight]);

  const wrapperContentStyle = React.useMemo(() => {
    const paddingVertical = (aimHeight - fontScale * lineHeight) / 2;
    return [
      defaultStyles.wrapper,
      intermediateWrapperStyle,
      {
        backgroundColor,
        borderWidth: 0,
        flex: 0,
        height: contentLines <= 1 ? aimHeight : undefined,
        padding: 0,
        paddingVertical,
      },
    ];
  }, [aimHeight, backgroundColor, contentLines, fontScale, intermediateWrapperStyle, lineHeight]);

  const wrapperStyle = React.useMemo(() => {
    const paddingVertical = (aimHeight - fontScale * lineHeight) / 2;
    const minHeight = paddingVertical * 2 + lineHeight * fontScale * minLines;
    const maxHeight = paddingVertical * 2 + lineHeight * fontScale * maxLines;
    return [
      {
        flex: 1,
        flexBasis: aimHeight,
        height,
        maxHeight,
        minHeight,
      },
    ];
  }, [aimHeight, fontScale, height, lineHeight, maxLines, minLines]);

  return (
    <View style={UI_STYLES.flex1}>
      <ScrollView
        style={wrapperStyle}
        contentContainerStyle={wrapperContentStyle}
        showsVerticalScrollIndicator={contentLines > maxLines}>
        <TextInput multiline style={inputStyle} {...props} scrollEnabled={false} onContentSizeChange={onContentSizeChange} />
      </ScrollView>
      {backgroundColor && <TextAreaDecoration color={backgroundColor} />}
      {children}
    </View>
  );
};
