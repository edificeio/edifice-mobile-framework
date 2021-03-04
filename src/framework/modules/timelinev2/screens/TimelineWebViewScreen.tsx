import * as React from "react";
import { View, Linking } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import I18n from "i18n-js";

import { IResourceUriNotification, ITimelineNotification } from "../../../notifications";
import { Text } from "../../../components/text";
import withViewTracking from "../../../tracker/withViewTracking";
import NotificationTopInfo from "../components/NotificationTopInfo";
import { PageView } from "../../../components/page";
import { InfoBubble } from "../../../components/infoBubble";
import { FlatButton } from "../../../../ui";
import { Card } from "../../../components/card";
import Conf from "../../../../../ode-framework-conf";
import { FakeHeader, HeaderAction, HeaderLeft, HeaderRow, HeaderTitle } from "../../../components/header";
import theme from "../../../theme";

// TYPES ==========================================================================================

export interface ITimelineWebViewScreenDataProps { };
export interface ITimelineWebViewScreenEventProps { };
export interface ITimelineWebViewScreenNavParams {
  notification: ITimelineNotification & IResourceUriNotification;
};
export type ITimelineWebViewScreenProps = ITimelineWebViewScreenDataProps
  & ITimelineWebViewScreenEventProps
  & NavigationInjectedProps<Partial<ITimelineWebViewScreenNavParams>>;

export interface ITimelineWebViewScreenState { };

// COMPONENT ======================================================================================

export class TimelineWebViewScreen extends React.PureComponent<
  ITimelineWebViewScreenProps,
  ITimelineWebViewScreenState
  > {

  // DECLARATIONS =================================================================================

  static navigationOptions = {
    header: () => null, // Header is included in screen
  }

  // RENDER =======================================================================================
  render() {
    return (
      <>
        {this.renderHeader()}
        <PageView>
          {this.renderRedirection()}
        </PageView>
      </>
    );
  }

  renderHeader() {
    const { navigation } = this.props;
    return (
      <FakeHeader>
        <HeaderRow>
          <HeaderLeft>
            <HeaderAction iconName="back" onPress={() => navigation.goBack()}/>
          </HeaderLeft>
          <HeaderTitle>{I18n.t("timeline.webViewScreen.title")}</HeaderTitle>
        </HeaderRow>
      </FakeHeader>
    );
  }

  renderRedirection() {
    const notification = this.props.navigation.getParam("notification");
    return (
      <Card>
        <InfoBubble
          infoText={I18n.t("timeline.webViewScreen.infoBubbleText")}
          infoBubbleType="regular"
          infoBubbleId="webViewScreen.redirect"
          style={{marginBottom: 20}}
        />
        <NotificationTopInfo notification={notification}/>
        <View style={{marginVertical: 10}}>
          <FlatButton
            title={I18n.t("timeline.webViewScreen.openInBrowser")}
            customButtonStyle={{backgroundColor: theme.color.tertiary.light}}
            customTextStyle={{color: theme.color.secondary.regular}}
            onPress={() => {
              //TODO: create generic function inside oauth (use in myapps, etc.)
              if (!Conf.currentPlatform) {
                console.warn("Must have a platform selected to redirect the user");
                return null;
              }
              const url = `${(Conf.currentPlatform as any).url}${notification?.resource.uri}`
              Linking.canOpenURL(url).then(supported => {
                if (supported) {
                  Linking.openURL(url);
                } else {
                  console.warn("[timeline] Don't know how to open URI: ", url);
                }
              });
            }}
          />
        </View>
      </Card>
    );
  }

  // LIFECYCLE ====================================================================================

  // METHODS ======================================================================================
}

// UTILS ==========================================================================================

// MAPPING ========================================================================================

const TimelineWebViewScreen_Connected = connect(() => ({}), () => ({}))(TimelineWebViewScreen);
export default withViewTracking("timeline/goto")(TimelineWebViewScreen_Connected);
