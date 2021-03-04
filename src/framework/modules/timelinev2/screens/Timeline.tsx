import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import I18n from "i18n-js";

import { PageContainer } from "../../../../ui/ContainerContent";
import { FakeHeader, HeaderAction, HeaderIcon, HeaderRow, HeaderTitle } from "../../../components/header";
import { Text } from "../../../components/text";

export interface ITimelineScreenDataProps { };
export interface ITimelineScreenEventProps { };
export type ITimelineScreenProps = ITimelineScreenDataProps & ITimelineScreenEventProps & NavigationInjectedProps;

export interface ITimelineScreenState { };

export default class TimelineScreen extends React.PureComponent<
  ITimelineScreenProps,
  ITimelineScreenState
  > {

  static navigationOptions = {
    header: () => null // Header is included in screen
  }

  render() {
    return <>
      {this.renderHeader()}
      <PageContainer>
        <Text>Timeline Screen</Text>
      </PageContainer>
    </>;
  }

  renderHeader() {
    const { navigation } = this.props;
    return <FakeHeader>
      <HeaderRow>
        <HeaderAction iconName="filter"/>
        <HeaderTitle>News</HeaderTitle>
        <HeaderIcon name={null}/>
      </HeaderRow>
    </FakeHeader>
  }

}
