import style from 'glamorous-native';
import I18n from 'i18n-js';
import * as React from 'react';
import { Keyboard, Platform } from 'react-native';

import { Weight } from './Typography';

import { CommonStyles } from '~/styles/common/styles';

export interface SearchBarProps {
  onChange: (searchText) => void;
  text?: string;
  autoFocus?: boolean;
}

export class SearchBar extends React.PureComponent<SearchBarProps, object> {
  private textInput: any;
  public state = {
    value: this.props.text || '',
  };

  public onChangeText(value) {
    this.props.onChange(value);
    this.setState({ value });
  }

  public render() {
    return (
      <TextInput
        autoFocus={!!this.props.autoFocus}
        enablesReturnKeyAutomatically
        onChangeText={value => this.onChangeText(value)}
        placeholder={I18n.t('Search')}
        placeholderTextColor="white"
        returnKeyType="search"
        underlineColorAndroid="transparent"
        value={this.state.value}
        blurOnSubmit
        onSubmitEditing={() => Keyboard.dismiss()}
      />
    );
  }
}

const TextInput = style.textInput(
  {
    alignSelf: 'center',
    color: 'white',
    flex: 1,
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 18,
    marginLeft: Platform.OS === 'ios' ? 10 : 0,
  },
  ({ value }) => ({
    fontWeight: value.length === 0 ? Weight.Light : Weight.Normal,
  }),
);
