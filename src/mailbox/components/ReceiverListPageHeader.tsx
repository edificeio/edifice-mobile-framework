import style from "glamorous-native";
import * as React from "react";
import I18n from "i18n-js";

import { Back } from "../../ui/headers/Back";
import { AppTitle, Header } from "../../ui/headers/Header";

export interface IReceiverListPageHeaderProps {
  navigation?: any;
  title?: string;
}

export const ReceiverListPageHeader = ({
  navigation,
  title
}: IReceiverListPageHeaderProps) => {
  const AppTitleStyled = style(AppTitle)({ textAlign: "left" });
  return (
    <Header>
      <Back navigation={navigation} />
      <AppTitleStyled>
        {title || I18n.t("conversation-receiverList")}
      </AppTitleStyled>
    </Header>
  );
};

export default ReceiverListPageHeader;
