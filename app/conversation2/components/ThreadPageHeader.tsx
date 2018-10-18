import * as React from "react";
import I18n from "react-native-i18n";

import { AppTitle, Header, HeaderIcon } from "../../ui/headers/Header";

export interface IThreadPageHeaderProps {
  navigation?: any;
  query?: string;
}

export const ThreadPageHeader = ({ navigation }: IThreadPageHeaderProps) => {
  return (
    <Header>
      <HeaderIcon name={null} hidden={true} />
      <AppTitle>Un message</AppTitle>
      <HeaderIcon name={null} hidden={true} />
    </Header>
  );
};

export default ThreadPageHeader;
