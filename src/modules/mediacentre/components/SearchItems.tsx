import I18n from 'i18n-js';
import React, { useState } from 'react';
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 2,
    borderRadius: 50,
    borderColor: theme.color.secondary.regular,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  buttonIcon: {
    marginRight: 5,
  },
});

interface SearchBarProps {
  inputRef: React.RefObject<TextInput>;

  onSubmitEditing: (query: string) => void;
}

interface IconButtonTextProps {
  color?: string;
  icon: string;
  text: string;

  onPress: () => void;
}

export const SearchBar: React.FunctionComponent<SearchBarProps> = (props: SearchBarProps) => {
  const [value, setValue] = useState<string>('');
  const onSearch = () => {
    props.onSubmitEditing(value);
  };
  return (
    <View style={styles.searchBarContainer}>
      <TextInput
        defaultValue={value}
        placeholder={I18n.t('mediacentre.find-resources')}
        returnKeyType="search"
        clearButtonMode="while-editing"
        onChangeText={text => setValue(text)}
        onSubmitEditing={onSearch}
        ref={props.inputRef}
        style={styles.searchInput}
      />
    </View>
  );
};

export const IconButtonText: React.FunctionComponent<IconButtonTextProps> = (props: IconButtonTextProps) => (
  <TouchableOpacity style={styles.buttonContainer} onPress={props.onPress}>
    <Icon style={styles.buttonIcon} size={16} color={props.color ? props.color : theme.color.secondary.regular} name={props.icon} />
    <Text style={{ color: theme.color.secondary.regular }}>{props.text}</Text>
  </TouchableOpacity>
);
