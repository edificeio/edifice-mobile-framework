import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  ColorValue,
  PixelRatio,
  Platform,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

import styles, { TEXTINPUT_LINE_HEIGHT } from './styles';
import {
  TextInputAnnotationProps,
  TextInputCustomToggleIconProps,
  TextInputMaxLengthIndicatorProps,
  TextInputProps,
  TextInputStatusIconProps,
} from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { CaptionItalicText, TextSizeStyle } from '~/framework/components/text';

const ICON_INPUT_SIZE = UI_SIZES.elements.icon.small;
export type TextInputType = RNTextInput;

const TextInputStatusIcon: React.FC<TextInputStatusIconProps> = ({ showError, toggleIconOff, toggleIconOn }) => {
  // position icon success || error management if have toggle icon or not
  const positionIconCallbackInput = useMemo(
    () =>
      toggleIconOn && toggleIconOff
        ? UI_SIZES.spacing.medium + 2 * UI_SIZES.spacing.small + ICON_INPUT_SIZE
        : UI_SIZES.spacing.medium,
    [toggleIconOn, toggleIconOff],
  );

  return (
    <Svg
      name={showError ? 'ui-error' : 'ui-success'}
      fill={showError ? theme.palette.status.failure.regular : theme.palette.status.success.regular}
      width={ICON_INPUT_SIZE}
      height={ICON_INPUT_SIZE}
      style={[styles.callbackIndicator, { right: positionIconCallbackInput }]}
    />
  );
};

const TextInputCustomToggleIcon: React.FC<TextInputCustomToggleIconProps> = ({
  colorStatus,
  disabled,
  onToggle,
  testIDToggle,
  toggleIconOff,
  toggleIconOn,
}) => {
  const [isToggle, setIsToggle] = useState<boolean>(false);

  const handleToggle = useCallback(() => {
    setIsToggle(!isToggle);
    if (onToggle) onToggle();
  }, [isToggle, onToggle]);

  return (
    <TouchableOpacity style={[styles.toggle, { borderColor: colorStatus }]} onPress={handleToggle} testID={testIDToggle ?? ''}>
      <Svg
        name={isToggle ? toggleIconOn : toggleIconOff}
        fill={disabled ? theme.palette.grey.graphite : theme.palette.grey.black}
        width={ICON_INPUT_SIZE}
        height={ICON_INPUT_SIZE}
      />
    </TouchableOpacity>
  );
};

const TextInputMaxLengthIndicator: React.FC<TextInputMaxLengthIndicatorProps> = ({ maxLength, valueLength }) => {
  const lengthCounter = `${valueLength}/${maxLength}`;
  const isMaxLengthReached = valueLength === maxLength;

  const textStyle = React.useMemo(
    () => [
      styles.maxLengthText,
      isMaxLengthReached && { color: theme.palette.status.failure.regular },
      {
        // Computing of vertical alignment of the label = Padding + half of the difference between the two sizes of texts.
        // TextInput sizing logic depends on the OS. On Android, we need to compensate the line-height included to the padding-bottom.
        bottom: Platform.select({
          android:
            (TextSizeStyle.Medium.lineHeight - TextSizeStyle.Small.lineHeight) / 2 +
            UI_SIZES.spacing.medium -
            ((styles.input.fontSize * TEXTINPUT_LINE_HEIGHT - TextSizeStyle.Small.lineHeight) * PixelRatio.getFontScale()) / 2,
          default:
            styles.input.paddingBottom -
            ((styles.input.fontSize * TEXTINPUT_LINE_HEIGHT - TextSizeStyle.Small.lineHeight) * PixelRatio.getFontScale()) / 2,
        }),
      },
    ],
    [isMaxLengthReached],
  );

  return <CaptionItalicText style={textStyle}>{lengthCounter}</CaptionItalicText>;
};

const TextInputAnnotation = ({ annotation, annotationStyle, showError, showSuccess, testIDCaption }: TextInputAnnotationProps) => (
  <CaptionItalicText
    style={React.useMemo(
      () => [
        styles.annotation,
        annotationStyle,
        { ...(showError ? styles.annotationError : showSuccess ? styles.annotationSuccess : null) },
      ],
      [annotationStyle, showError, showSuccess],
    )}
    testID={testIDCaption ?? ''}>
    {annotation}
  </CaptionItalicText>
);

const TextInput = forwardRef<RNTextInput, TextInputProps>((props: TextInputProps, ref) => {
  const {
    annotation,
    annotationStyle,
    disabled,
    maxLength,
    onBlur,
    onFocus,
    onToggle,
    showError = false,
    showStatusIcon: _showStatusIcon = false,
    showSuccess = false,
    style,
    testID,
    testIDCaption,
    testIDToggle,
    toggleIconOff,
    toggleIconOn,
    value,
  } = props;

  const [isFocused, setIsFocused] = useState<boolean>(false);

  const valueLength = value?.length ?? 0;

  const showCustomToggleIcon = toggleIconOn && toggleIconOff;

  const showStatusIcon = (showError || showSuccess) && _showStatusIcon;

  const colorStatus = useMemo((): ColorValue => {
    if (showError) return theme.palette.status.failure.regular;
    if (showSuccess) return theme.palette.status.success.regular;
    if (isFocused) return theme.palette.primary.light;
    if (disabled) return theme.palette.grey.grey;
    if (value) return theme.palette.grey.stone;
    return theme.ui.border.input;
  }, [disabled, isFocused, showError, showSuccess, value]);

  // padding right input management if have icon success || error or if have toggle icon or both :)
  const paddingRight = useMemo(
    () =>
      toggleIconOn && toggleIconOff && showStatusIcon
        ? UI_SIZES.spacing.medium + 2 * ICON_INPUT_SIZE + UI_SIZES.spacing.minor + 2 * UI_SIZES.spacing.small
        : toggleIconOn && toggleIconOff
          ? UI_SIZES.spacing.medium + ICON_INPUT_SIZE + 2 * UI_SIZES.spacing.small
          : showStatusIcon
            ? UI_SIZES.spacing.medium + ICON_INPUT_SIZE + UI_SIZES.spacing.minor
            : UI_SIZES.spacing.medium,
    [showStatusIcon, toggleIconOff, toggleIconOn],
  );

  const textInputStyle = useMemo(
    () => [
      styles.input,
      { borderColor: colorStatus, paddingRight },
      { ...(disabled ? styles.inputDisabled : null) },
      maxLength ? { ...styles.inputWithMaxLength } : null,
      style,
    ],
    [colorStatus, disabled, paddingRight, style, maxLength],
  );

  const handleFocus = useCallback<NonNullable<RNTextInputProps['onFocus']>>(
    e => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    },
    [onFocus],
  );

  const handleBlur: NonNullable<RNTextInputProps['onBlur']> = useCallback(
    e => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    },
    [onBlur],
  );

  return (
    <View>
      <View style={styles.viewInput} testID={testID ?? ''}>
        <RNTextInput
          {...props}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={theme.palette.grey.stone}
          ref={ref}
          {...(disabled ? { editable: false, placeholderTextColor: theme.palette.grey.graphite } : null)}
          style={textInputStyle}
        />
        {showStatusIcon && <TextInputStatusIcon showError={showError} toggleIconOn={toggleIconOn} toggleIconOff={toggleIconOff} />}
        {showCustomToggleIcon && (
          <TextInputCustomToggleIcon
            colorStatus={colorStatus}
            disabled={disabled}
            onToggle={onToggle}
            testIDToggle={testIDToggle}
            toggleIconOff={toggleIconOff}
            toggleIconOn={toggleIconOn}
          />
        )}
        {maxLength && <TextInputMaxLengthIndicator maxLength={maxLength} valueLength={valueLength} />}
      </View>
      <TextInputAnnotation
        annotation={annotation}
        annotationStyle={annotationStyle}
        showError={showError}
        showSuccess={showSuccess}
        testIDCaption={testIDCaption}
      />
    </View>
  );
});

export default TextInput;
