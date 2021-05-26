import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import I18n from "i18n-js";

import { PageContainer } from "../../../../ui/ContainerContent";
import { FakeHeader, HeaderAction, HeaderIcon, HeaderRow, HeaderTitle } from "../../../components/header";
import { Text } from "../../../components/text";
import { ITimelineState } from "../state";
import { Dispatch } from "redux";

export interface ITimelineScreenDataProps { };
export interface ITimelineScreenEventProps {
  handleInitTimeline(): void,
  handleFetchPage(page: number): boolean
};
export type ITimelineScreenProps = ITimelineScreenDataProps & ITimelineScreenEventProps & NavigationInjectedProps;

export enum TimelineLoadingState {
  PRISTINE, INIT, REfRESH, DONE
}
export interface ITimelineScreenState {
  loadingState: TimelineLoadingState;
};

export default class TimelineScreen extends React.PureComponent<
  ITimelineScreenProps,
  ITimelineScreenState
  > {

  static navigationOptions = {
    header: () => null, // Header is included in screen
  }

  state: ITimelineScreenState = {
    loadingState: TimelineLoadingState.PRISTINE
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
        <HeaderTitle>{I18n.t("timeline-appname")}</HeaderTitle>
        <HeaderIcon name={null}/>
      </HeaderRow>
    </FakeHeader>
  }

  constructor(props: ITimelineScreenProps) {
    super(props);
    try {
      props.handleInitTimeline();
    } catch (e) {

    }
  }
}

const mapStateToProps = (state: ITimelineState) => ({});

const mapDispatchToProps = (dispatch: Dispatch, getState: () => ITimelineState) => ({
  handleInitTimeline: () => {  }
})