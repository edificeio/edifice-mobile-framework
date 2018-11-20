import style from "glamorous-native";
import * as React from "react";
import I18n from "i18n-js";;

import { AppTitle, Header, HeaderIcon } from "../../../ui/headers/Header";

export interface IHomeworkFilterPageHeaderProps {
  navigation?: any;
}

export const HomeworkFilterPageHeader = ({
  navigation
}: IHomeworkFilterPageHeaderProps) => {
  const AppTitleStyled = style(AppTitle)({ textAlign: "left" });
  return (
    <Header>
      <HeaderIcon name="close" onPress={() => navigation.goBack()} />
      <AppTitleStyled>{I18n.t("homework-select")}</AppTitleStyled>
      <HeaderIcon name={null} hidden={true} />
    </Header>
  );
};

export default HomeworkFilterPageHeader;
