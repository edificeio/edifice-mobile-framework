/**
 * HomeworkTaskPage
 *
 * Display page for just one task just one day.
 */

// imports ----------------------------------------------------------------------------------------

import style from "glamorous-native";
import * as React from "react";
const { Text } = style;

import { PageContainer } from "../../ui/ContainerContent";
import { Back } from "../../ui/headers/Back";
import { AppTitle, Header } from "../../ui/headers/Header";

import moment from "moment";
// tslint:disable-next-line:no-submodule-imports
import "moment/locale/fr";
moment.locale("fr");

// helpers ----------------------------------------------------------------------------------------

// Header component -------------------------------------------------------------------------------

// tslint:disable-next-line:max-classes-per-file
export class HomeworkTaskPageHeader extends React.Component<
  { navigation?: any },
  undefined
> {
  public render() {
    return (
      <Header>
        <Back navigation={this.props.navigation} />
        <AppTitle>Pour le JJ/MM</AppTitle>
      </Header>
    );
  }
}

// Main component ---------------------------------------------------------------------------------

// tslint:disable-next-line:max-classes-per-file
export class HomeworkTaskPage extends React.Component<{}, {}> {
  constructor(props) {
    super(props);
  }

  // render & lifecycle

  public render() {
    return (
      <PageContainer>
        <Text>Salut c'est ouam</Text>
      </PageContainer>
    );
  }
}
