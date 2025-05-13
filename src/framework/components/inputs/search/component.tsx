import React, { forwardRef, useCallback, useMemo } from 'react';
import { TextInput as RNTextInput, TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { SearchInputProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import TextInput from '~/framework/components/inputs/text';
import { ICON_INPUT_SIZE } from '~/framework/components/inputs/text/component';
import { Svg } from '~/framework/components/picture';

const SearchInput = forwardRef<RNTextInput, SearchInputProps>((props: SearchInputProps, ref) => {
  const [value, setValue] = React.useState<string>(props.value ?? '');

  const paddingLeft = useMemo(() => 2 * UI_SIZES.spacing.small + ICON_INPUT_SIZE, []);
  const paddingRight = useMemo(() => (!value ? UI_SIZES.spacing.small : 2 * UI_SIZES.spacing.small + ICON_INPUT_SIZE), [value]);

  const onChangeText = (text: string) => {
    setValue(text);
    props.onChangeText?.(text);
  };

  const clearInput = useCallback(() => {
    setValue('');
    props.onChangeText?.('');
    props.onClear?.();
  }, [props]);

  const renderClearIcon = useMemo(() => {
    if (!value) return null;
    return (
      <TouchableOpacity onPress={clearInput} style={[styles.icon, styles.iconClear]}>
        <Svg name="ui-close" fill={theme.palette.grey.black} width={ICON_INPUT_SIZE} height={ICON_INPUT_SIZE} />
      </TouchableOpacity>
    );
  }, [clearInput, value]);

  return (
    <View style={styles.container}>
      <Svg
        name="ui-search"
        fill={theme.palette.grey.black}
        width={ICON_INPUT_SIZE}
        height={ICON_INPUT_SIZE}
        style={[styles.icon, styles.iconSearch]}
      />
      {renderClearIcon}
      <TextInput
        {...props}
        placeholder={I18n.get('common-search')}
        style={[
          styles.input,
          {
            paddingLeft,
            paddingRight,
          },
        ]}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        ref={ref}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
});

export default SearchInput;
