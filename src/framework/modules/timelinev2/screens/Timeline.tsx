import * as React from "react";
import { NavigationInjectedProps, NavigationParams, NavigationScreenConfig } from "react-navigation";
import { NavigationStackOptions } from "react-navigation-stack";

import { Text } from "../../../../ui/text";

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
    return <Text>Timeline Screen</Text>
  }

}
