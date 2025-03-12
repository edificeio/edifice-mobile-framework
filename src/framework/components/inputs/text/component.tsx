import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { ColorValue, TextInput as RNTextInput, TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { TextInputProps } from './types';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { CaptionItalicText } from '~/framework/components/text';

const ICON_INPUT_SIZE = UI_SIZES.elements.icon.small;

export type TextInputType = RNTextInput;

const TextInput = forwardRef<RNTextInput, TextInputProps>((props: TextInputProps, ref) => {
  const {
    annotation,
    disabled,
    maxLength,
    onBlur,
    onFocus,
    onToggle,
    showError,
    showIconCallback,
    showSuccess,
    style,
    testID,
    testIDCaption,
    testIDToggle,
    toggleIconOff,
    toggleIconOn,
    value,
  } = props;

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isToggle, setIsToggle] = useState<boolean>(false);
  const [length, setLength] = useState<number>(0);

  const isShowIconCallback = useMemo(
    () => (showError || showSuccess) && showIconCallback,
    [showError, showSuccess, showIconCallback],
  );

  // padding right input management if have icon success || error or if have toggle icon or both :)
  const paddingRight = useMemo(() => {
    let val = UI_SIZES.spacing.medium;
    if (toggleIconOn && toggleIconOff) val += ICON_INPUT_SIZE + 2 * UI_SIZES.spacing.small;
    if (isShowIconCallback) val += ICON_INPUT_SIZE + UI_SIZES.spacing.minor;
    if (maxLength) val += getScaleWidth(36) + UI_SIZES.spacing.minor;
    return val;
  }, [toggleIconOn, toggleIconOff, isShowIconCallback, maxLength]);
  // position icon success || error management if have toggle icon or not
  const positionIconCallbackInput = useMemo(() => {
    let val = UI_SIZES.spacing.medium;
    if (toggleIconOn && toggleIconOff) val += 2 * UI_SIZES.spacing.small + ICON_INPUT_SIZE;
    return val;
  }, [toggleIconOn, toggleIconOff]);

  const positionMaxLengthInput = useMemo(() => {
    let val = UI_SIZES.spacing.medium;
    if (toggleIconOn && toggleIconOff) val += 2 * UI_SIZES.spacing.small + ICON_INPUT_SIZE;
    if (isShowIconCallback) val += ICON_INPUT_SIZE + UI_SIZES.spacing.minor;
    return val;
  }, [toggleIconOn, toggleIconOff, isShowIconCallback]);

  const colorStatus = useCallback((): ColorValue => {
    if (showError) return theme.palette.status.failure.regular;
    if (showSuccess) return theme.palette.status.success.regular;
    if (isFocused) return theme.palette.primary.light;
    if (disabled) return theme.palette.grey.grey;
    if (value) return theme.palette.grey.stone;
    return theme.ui.border.input;
  }, [disabled, isFocused, showError, showSuccess, value]);

  const handleFocus = useCallback(
    e => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    e => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    },
    [onBlur],
  );

  const handleToggle = useCallback(() => {
    setIsToggle(!isToggle);
    if (onToggle) onToggle();
  }, [isToggle, onToggle]);

  const handleChangeText = useCallback(
    text => {
      setLength(text.length);
      if (props.onChangeText) props.onChangeText(text);
    },
    [props],
  );

  const renderIconInput = useCallback(() => {
    if (isShowIconCallback)
      return (
        <Svg
          name={showError ? 'ui-error' : 'ui-success'}
          fill={showError ? theme.palette.status.failure.regular : theme.palette.status.success.regular}
          width={ICON_INPUT_SIZE}
          height={ICON_INPUT_SIZE}
          style={[styles.callbackIndicator, { right: positionIconCallbackInput }]}
        />
      );
  }, [isShowIconCallback, positionIconCallbackInput, showError]);

  const renderToggle = useCallback(() => {
    if (toggleIconOn && toggleIconOff)
      return (
        <TouchableOpacity
          style={[styles.toggle, { borderColor: colorStatus() }]}
          onPress={() => handleToggle()}
          testID={testIDToggle ?? ''}>
          <Svg
            name={isToggle ? toggleIconOn : toggleIconOff}
            fill={disabled ? theme.palette.grey.graphite : theme.palette.grey.black}
            width={ICON_INPUT_SIZE}
            height={ICON_INPUT_SIZE}
          />
        </TouchableOpacity>
      );
  }, [toggleIconOn, toggleIconOff, colorStatus, testIDToggle, isToggle, disabled, handleToggle]);

  const renderMaxLength = useCallback(() => {
    if (maxLength)
      return (
        <CaptionItalicText
          style={[
            styles.callbackIndicator,
            { right: positionMaxLengthInput },
            length === maxLength ? styles.callbackMaxLength : {},
          ]}>{`${length}/${maxLength}`}</CaptionItalicText>
      );
  }, [maxLength, positionMaxLengthInput, length]);

  const renderInput = useCallback(() => {
    return (
      <View style={styles.viewInput} testID={testID ?? ''}>
        <RNTextInput
          {...props}
          onFocus={e => handleFocus(e)}
          onBlur={e => handleBlur(e)}
          onChangeText={handleChangeText}
          placeholderTextColor={theme.palette.grey.stone}
          ref={ref}
          {...(disabled ? { editable: false, placeholderTextColor: theme.palette.grey.graphite } : null)}
          style={[
            styles.input,
            { borderColor: colorStatus(), paddingRight },
            { ...(disabled ? styles.inputDisabled : null) },
            style,
          ]}
        />
        {renderMaxLength()}
        {renderIconInput()}
        {renderToggle()}
      </View>
    );
  }, [
    testID,
    props,
    handleChangeText,
    ref,
    disabled,
    colorStatus,
    paddingRight,
    style,
    renderMaxLength,
    renderIconInput,
    renderToggle,
    handleFocus,
    handleBlur,
  ]);

  const renderAnnotation = useCallback(() => {
    if (annotation)
      return (
        <CaptionItalicText
          style={[
            styles.annotation,
            props.annotationStyle,
            { ...(showError ? styles.annotationError : showSuccess ? styles.annotationSuccess : null) },
          ]}
          testID={testIDCaption ?? ''}>
          {annotation}
        </CaptionItalicText>
      );
  }, [annotation, props.annotationStyle, showError, showSuccess, testIDCaption]);

  return (
    <View>
      {renderInput()}
      {renderAnnotation()}
    </View>
  );
});

export default TextInput;
