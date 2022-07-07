import I18n from 'i18n-js';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { Text } from '~/framework/components/text';

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 20, // MO-142 use UI_SIZES.spacing here
    paddingVertical: 10, // MO-142 use UI_SIZES.spacing here
    borderWidth: 2,
    borderRadius: 50,
    borderColor: theme.palette.primary.regular,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // MO-142 use UI_SIZES.spacing here
  },
  buttonIcon: {
    marginRight: 5, // MO-142 use UI_SIZES.spacing here
  },
});

export interface ISearchBarHandle {
  blur: () => void;
  clear: () => void;
}

interface ISearchBarProps {
  onSubmitEditing: (query: string) => void;
}

interface IIconButtonTextProps {
  color?: string;
  icon: string;
  text: string;

  onPress: () => void;
}

export const SearchBar: React.FunctionComponent<ISearchBarProps> = forwardRef<ISearchBarHandle, ISearchBarProps>(
  (props: ISearchBarProps, ref) => {
    const [value, setValue] = useState<string>('');
    const inputRef = useRef<TextInput>(null);
    const onSearch = () => {
      if (value.length) {
        props.onSubmitEditing(value);
      }
    };
    const blur = () => {
      if (inputRef.current) {
        inputRef.current.blur();
      }
    };
    const clear = () => {
      if (inputRef.current) {
        inputRef.current.clear();
        setValue('');
      }
    };
    useImperativeHandle(ref, () => ({ blur, clear }));
    return (
      <View style={styles.searchBarContainer}>
        <TextInput
          defaultValue={value}
          placeholder={I18n.t('mediacentre.find-resources')}
          returnKeyType="search"
          clearButtonMode="while-editing"
          onChangeText={text => setValue(text)}
          onSubmitEditing={onSearch}
          style={styles.searchInput}
          ref={inputRef}
        />
      </View>
    );
  },
);

export const IconButtonText: React.FunctionComponent<IIconButtonTextProps> = (props: IIconButtonTextProps) => (
  <TouchableOpacity style={styles.buttonContainer} onPress={props.onPress}>
    <Icon style={styles.buttonIcon} size={16} color={props.color ? props.color : theme.palette.primary.regular} name={props.icon} />
    <Text style={{ color: theme.palette.primary.regular }}>{props.text}</Text>
  </TouchableOpacity>
);
