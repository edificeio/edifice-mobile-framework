import * as React from "react";
import { View } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { IResourceUriNotification } from "../reducer/notifications";
import { Text } from "../../../components/text";
import withViewTracking from "../../../tracker/withViewTracking";

// TYPES ==========================================================================================

export interface ITimelineWebViewScreenDataProps { };
export interface ITimelineWebViewScreenEventProps { };
export interface ITimelineWebViewScreenNavParams {
  notification: IResourceUriNotification;
};
export type ITimelineWebViewScreenProps = ITimelineWebViewScreenDataProps & ITimelineWebViewScreenEventProps & NavigationInjectedProps<Partial<ITimelineWebViewScreenNavParams>>;

export interface ITimelineWebViewScreenState { };

// COMPONENT ======================================================================================

export class TimelineWebViewScreen extends React.PureComponent<
  ITimelineWebViewScreenProps,
  ITimelineWebViewScreenState
  > {

  // DECLARATIONS =================================================================================

  // RENDER =======================================================================================

  render() {
    return <View>
      <Text>Trux</Text>
      <Text>{this.props.navigation.getParam('notification')?.resource.uri}</Text>
      <Text>{this.props.navigation.getParam('notification')?.message}</Text>
    </View>;
  }

  // LIFECYCLE ====================================================================================

  // METHODS ======================================================================================
}

// UTILS ==========================================================================================

// MAPPING ========================================================================================

const TimelineWebViewScreen_Connected = connect(() => ({}), () => ({}))(TimelineWebViewScreen);
export default withViewTracking("timeline/goto")(TimelineWebViewScreen_Connected);
