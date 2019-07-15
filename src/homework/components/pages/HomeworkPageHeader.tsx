// Libraries
import style from "glamorous-native";
import * as React from "react";
import I18n from "i18n-js";

// Components
import { AppTitle, Header, HeaderIcon } from "../../../ui/headers/Header";

import moment from "moment";
// tslint:disable-next-line:no-submodule-imports
import "moment/locale/fr";
moment.locale("fr");

export interface IHomeworkPageHeaderProps {
  navigation?: any;
  date?: moment.Moment;
}

export const HomeworkPageHeader = ({
  navigation,
  date
}: IHomeworkPageHeaderProps) => {
  let headerText = date ? date.format("MMMM YYYY") : null;
  headerText = headerText
    ? headerText.charAt(0).toUpperCase() + headerText.slice(1)
    : I18n.t("Homework");

  return (
    <Header>
      <HeaderIcon
        onPress={() => navigation.navigate("HomeworkFilter")}
        name="filter"
      />
      <AppTitle>{headerText}</AppTitle>
      <HeaderIcon name={null} hidden={true} />
    </Header>
  );
};

export default HomeworkPageHeader;
