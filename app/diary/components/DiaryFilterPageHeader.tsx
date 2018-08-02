import style from "glamorous-native";
import * as React from "react";
import I18n from "react-native-i18n";

import { AppTitle, Header, HeaderIcon } from "../../ui/headers/Header";

export interface IDiaryFilterPageHeaderProps {
  navigation?: any;
}

export const DiaryFilterPageHeader = ({
  navigation
}: IDiaryFilterPageHeaderProps) => {
  const AppTitleStyled = style(AppTitle)({ textAlign: "left" });
  return (
    <Header>
      <HeaderIcon name="close" onPress={() => this.props.navigation.goBack()} />
      <AppTitleStyled>{I18n.t("diary-select")}</AppTitleStyled>
      <HeaderIcon name={null} hidden={true} />
    </Header>
  );
};

export default DiaryFilterPageHeader;
