import React, { useRef, useState } from 'react';
import { Platform, TextInput, TouchableOpacity } from 'react-native';

import styles from './styles';
import { SearchBarHandle, SearchBarPropsWithFocus } from './types';

import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import { Svg } from '~/framework/components/picture';

export const SearchBar = React.forwardRef<SearchBarHandle, SearchBarPropsWithFocus>((props, ref) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setFocused] = useState(false);

  const focusInput = () => inputRef.current?.focus();

  const handleClear = () => {
    props.onChangeQuery('');
    props.onClear?.();
  };

  const handleFocus = () => {
    setFocused(true);
    props.onFocusChange?.(true);
  };

  const handleBlur = () => {
    setFocused(false);
    props.onFocusChange?.(false);
  };

  React.useImperativeHandle(
    ref,
    () => ({
      blur: () => inputRef.current?.blur(),
      clear: () => inputRef.current?.clear(),
      focus: () => inputRef.current?.focus(),
      isFocused: () => !!inputRef.current?.isFocused?.(),
    }),
    [],
  );

  const effectiveFocused = props.forceUnfocusedStyle ? false : isFocused;

  const borderColor = React.useMemo(() => {
    return effectiveFocused ? theme.palette.secondary.light : props.query ? theme.palette.grey.stone : theme.palette.grey.cloudy;
  }, [effectiveFocused, props.query]);

  return (
    <TouchableOpacity onPress={focusInput} activeOpacity={1} style={[styles.container, { borderColor }, props.containerStyle]}>
      <Svg name="ui-search" width={20} height={20} fill={theme.ui.text.regular} style={styles.searchIcon} />
      <TextInput
        ref={inputRef}
        value={props.query}
        onChangeText={props.onChangeQuery}
        onSubmitEditing={props.onSearch}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={props.placeholder}
        placeholderTextColor={theme.ui.text.light}
        autoCapitalize="none"
        autoCorrect={false}
        inputMode="search"
        returnKeyType="search"
        style={[styles.textInput, Platform.OS === 'ios' && styles.textInputIOS]}
      />
      {props.query.length ? (
        <IconButton color={props.clearButtonCustomColor} icon="ui-close" action={handleClear} style={styles.clearButton} />
      ) : null}
    </TouchableOpacity>
  );
});
