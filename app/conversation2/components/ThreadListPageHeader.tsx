import * as React from "react";
import I18n from "react-native-i18n";

import { AppTitle, Header, HeaderIcon } from "../../ui/headers/Header";

export interface IThreadListPageHeaderProps {
  navigation?: any;
  query?: string;
}

export const ThreadListPageHeader = ({
  navigation
}: IThreadListPageHeaderProps) => {
  return (
    <Header>
      <HeaderIcon name={null} hidden={true} />
      <AppTitle>Machin</AppTitle>
      <HeaderIcon name={null} hidden={true} />
    </Header>
  );
};

export default ThreadListPageHeader;
