import I18n from 'i18n-js';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';

import theme from '~/app/theme';
import { Text } from '~/framework/components/text';
import { Icon } from '~/ui/icons/Icon';

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchInput: {
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flex: 1,
    borderWidth: 2,
    borderRadius: 50,
    borderColor: '#F53B56',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 5,
  },
});

interface SearchBarProps {
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
        style={styles.searchInput}
        placeholder={I18n.t('mediacentre.find-resources')}
        placeholderTextColor="grey"
        numberOfLines={1}
        defaultValue={value}
        returnKeyType="search"
        onChangeText={text => setValue(text)}
        onSubmitEditing={onSearch}
      />
    </View>
  );
};

export const IconButtonText: React.FunctionComponent<IconButtonTextProps> = (props: IconButtonTextProps) => (
  <TouchableOpacity style={styles.buttonContainer} onPress={props.onPress}>
    <Icon style={styles.buttonIcon} size={16} color={props.color ? props.color : theme.themeOpenEnt.cyan} name={props.icon} />
    <Text style={{ color: theme.themeOpenEnt.cyan }}>{props.text}</Text>
  </TouchableOpacity>
);
