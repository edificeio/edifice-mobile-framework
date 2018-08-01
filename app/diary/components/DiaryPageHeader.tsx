// Libraries
import style from "glamorous-native";
import * as React from "react";
import I18n from "react-native-i18n";

// Components
import { AppTitle, Header, HeaderIcon } from "../../ui/headers/Header";

import moment from "moment";
// tslint:disable-next-line:no-submodule-imports
import "moment/locale/fr";
moment.locale("fr");

export default class DiaryPageHeader extends React.Component<
  { navigation?: any; date?: moment.Moment },
  undefined
> {
  public render() {
    let headerText = this.props.date
      ? this.props.date.format("MMMM YYYY")
      : null;
    headerText = headerText
      ? headerText.charAt(0).toUpperCase() + headerText.slice(1)
      : I18n.t("Diary");

    return (
      <Header>
        <HeaderIcon
          onPress={() => this.props.navigation.navigate("DiaryFilter")}
          name="filter"
        />
        <AppTitle>{headerText}</AppTitle>
        <HeaderIcon name={null} hidden={true} />
      </Header>
    );
  }
}
