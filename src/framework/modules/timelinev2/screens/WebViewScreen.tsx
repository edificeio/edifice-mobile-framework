import * as React from "react";
import { View } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { IResourceUriNotification } from "../reducer/notifications";
import { Text } from "../../../components/text";
import withViewTracking from "../../../tracker/withViewTracking";

// TYPES ==========================================================================================

export interface IWebViewScreenDataProps { };
export interface IWebViewScreenEventProps { };
export interface IWebViewScreenNavParams {
  notification: IResourceUriNotification
};
export type IWebViewScreenProps = IWebViewScreenDataProps & IWebViewScreenEventProps & NavigationInjectedProps<IWebViewScreenNavParams>;

export interface IWebViewScreenState { };

// COMPONENT ======================================================================================

export class WebViewScreen extends React.PureComponent<
  IWebViewScreenProps,
  IWebViewScreenState
  > {

  // DECLARATIONS =================================================================================

  // RENDER =======================================================================================

  render() {
    return <View>
      <Text>Trux</Text>
      <Text>{this.props.navigation.getParam('notification').resource.uri}</Text>
      <Text>{this.props.navigation.getParam('notification').message}</Text>
    </View>;
  }

  // LIFECYCLE ====================================================================================

  // METHODS ======================================================================================
}

// UTILS ==========================================================================================

// MAPPING ========================================================================================

const WebViewScreen_Connected = connect(() => ({}), () => ({}))(WebViewScreen);
export default withViewTracking("timeline/goto")(WebViewScreen_Connected);
