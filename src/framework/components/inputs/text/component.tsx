import React, { useCallback, useMemo, useState } from 'react';
import { ColorValue, TextInput as RNTextInput, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { CaptionItalicText } from '~/framework/components/text';

import styles from './styles';
import { TextInputProps } from './types';

const ICON_INPUT_SIZE = 20;

export default function TextInput(props: TextInputProps) {
  const { annotation, showError, showSuccess, toggleIconOn, toggleIconOff, value, disabled, onToggle, onFocus, onBlur } = props;

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isToggle, setIsToggle] = useState<boolean>(false);

  // padding right input management if have icon success || error or if have toggle icon or both :)
  const paddingRight = useMemo(
    () =>
      toggleIconOn && toggleIconOff
        ? UI_SIZES.spacing.medium + ICON_INPUT_SIZE + UI_SIZES.spacing.minor + 2 * UI_SIZES.spacing.small + ICON_INPUT_SIZE
        : showError || showSuccess
        ? UI_SIZES.spacing.medium + ICON_INPUT_SIZE + UI_SIZES.spacing.minor
        : UI_SIZES.spacing.medium,
    [toggleIconOn, toggleIconOff, showError, showSuccess],
  );
  // position icon success || error management if have toggle icon or not
  const positionIconCallbackInput = useMemo(
    () =>
      toggleIconOn && toggleIconOff
        ? UI_SIZES.spacing.medium + 2 * UI_SIZES.spacing.small + ICON_INPUT_SIZE
        : UI_SIZES.spacing.medium,
    [toggleIconOn, toggleIconOff],
  );

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

  const renderIconInput = useCallback(() => {
    if (showError || showSuccess)
      return (
        <NamedSVG
          name={showError ? 'ui-error' : 'ui-success'}
          fill={showError ? theme.palette.status.failure.regular : theme.palette.status.success.regular}
          width={ICON_INPUT_SIZE}
          height={ICON_INPUT_SIZE}
          style={[styles.callbackIndicator, { right: positionIconCallbackInput }]}
        />
      );
  }, [positionIconCallbackInput, showError, showSuccess]);

  const renderToggle = useCallback(() => {
    if (toggleIconOn && toggleIconOff)
      return (
        <TouchableOpacity style={[styles.toggle, { borderColor: colorStatus() }]} onPress={() => handleToggle()}>
          <NamedSVG
            name={isToggle ? toggleIconOn : toggleIconOff}
            fill={disabled ? theme.palette.grey.graphite : theme.palette.grey.black}
            width={ICON_INPUT_SIZE}
            height={ICON_INPUT_SIZE}
          />
        </TouchableOpacity>
      );
  }, [colorStatus, disabled, handleToggle, toggleIconOn, toggleIconOff, isToggle]);

  const renderInput = useCallback(() => {
    return (
      <View>
        <RNTextInput
          onFocus={e => handleFocus(e)}
          onBlur={e => handleBlur(e)}
          style={[styles.input, { paddingRight, borderColor: colorStatus() }, { ...(disabled ? styles.inputDisabled : null) }]}
          {...(disabled ? { editable: false, placeholderTextColor: theme.palette.grey.graphite } : null)}
          {...props}
        />
        {renderIconInput()}
        {renderToggle()}
      </View>
    );
  }, [paddingRight, colorStatus, disabled, props, renderIconInput, renderToggle, handleFocus, handleBlur]);

  const renderAnnotation = useCallback(() => {
    if (annotation)
      return (
        <CaptionItalicText
          style={[styles.annotation, { ...(showError ? styles.annotationError : showSuccess ? styles.annotationSuccess : null) }]}>
          {annotation}
        </CaptionItalicText>
      );
  }, [annotation, showError, showSuccess]);

  return (
    <View>
      {renderInput()}
      {renderAnnotation()}
    </View>
  );
}
