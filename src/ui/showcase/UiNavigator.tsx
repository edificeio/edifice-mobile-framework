import * as React from "react";
import { createStackNavigator } from "react-navigation";
import { standardNavScreenOptions } from "../../navigation/helpers/navBuilder";
import { AppTitle, Header } from "../headers/Header";
import { UiShowCase } from "./UiShowcase";

export default createStackNavigator({
  UiShowcase: {
    screen: UiShowCase,
    navigationOptions: ({ navigation }) =>
      standardNavScreenOptions(
        {
          header: <UiHeader navigation={navigation} />
        },
        navigation
      )
  }
});

export class UiHeader extends React.Component<{ navigation?: any }, undefined> {
  render() {
    return (
      <Header>
        <AppTitle>UI Showcase</AppTitle>
      </Header>
    );
  }
}
