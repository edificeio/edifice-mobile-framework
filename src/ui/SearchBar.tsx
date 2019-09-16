import style from "glamorous-native";
import * as React from "react";
import { Keyboard } from "react-native";
import { CommonStyles } from "../styles/common/styles";
import { Header, HeaderIcon } from "./headers/Header";
import { CloseIcon, SearchIcon } from "./icons/SearchIcon";
import { connect } from "react-redux";
import I18n from "i18n-js";
import { Weight } from "./Typography";

export interface SearchBarProps {
  onChange: (searchText) => void;
  text?: string;
  autoFocus?: boolean;
}

export class SearchBar extends React.PureComponent<SearchBarProps, {}> {
  private textInput: any;
  public state = {
    value: this.props.text || ""
  };

  public onChangeText(value) {
    this.props.onChange(value);
    this.setState({ value });
  }

  public render() {
    return (
      <TextInput
        autoFocus={!!this.props.autoFocus}
        enablesReturnKeyAutomatically={true}
        onChangeText={value => this.onChangeText(value)}
        placeholder={I18n.t("Search")}
        placeholderTextColor={"white"}
        returnKeyType={"search"}
        underlineColorAndroid={"transparent"}
        value={this.state.value}
        blurOnSubmit={true}
        onSubmitEditing={() => Keyboard.dismiss()}
      />
    );
  }
}

const TextInput = style.textInput(
  {
    alignSelf: "center",
    color: "white",
    flex: 1,
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 18,
    marginLeft: 8
  },
  ({ value }) => ({
    fontWeight: value.length === 0 ? Weight.Light : Weight.Normal
  })
);
