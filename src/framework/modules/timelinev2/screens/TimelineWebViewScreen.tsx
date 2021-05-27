import * as React from "react";
import { Linking, Platform, Text, View } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import I18n from "i18n-js";

import { IResourceUriNotification, ITimelineNotification } from "../../../util/notifications";
import withViewTracking from "../../../util/tracker/withViewTracking";
import NotificationTopInfo from "../components/NotificationTopInfo";
import { PageView } from "../../../components/page";
import { InfoBubble } from "../../../components/infoBubble";
import { FlatButton } from "../../../../ui";
import Conf from "../../../../../ode-framework-conf";
import { FakeHeader, HeaderAction, HeaderCenter, HeaderLeft, HeaderRow, HeaderTitle } from "../../../components/header";
import theme from "../../../util/theme";

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
            <HeaderAction
              iconName={(Platform.OS === "ios") ? "chevron-left1" : "back"}
              onPress={() => navigation.goBack()}
           />
          </HeaderLeft>
          <HeaderCenter>
            <HeaderTitle>{I18n.t("timeline.webViewScreen.title")}</HeaderTitle>
          </HeaderCenter>
        </HeaderRow>
      </FakeHeader>
    );
  }

  renderError() {
    return <Text>{"Error"}</Text> // ToDo: great error screen here
  }

  renderRedirection() {
    const notification = this.props.navigation.getParam("notification");
    if (!notification) return this.renderError();
    return (
      <View style={{flex: 1, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: theme.color.background.card}}>
        <InfoBubble
          infoText={I18n.t("timeline.webViewScreen.infoBubbleText")}
          infoBubbleType="regular"
          infoBubbleId="webViewScreen.redirect"
          style={{marginBottom: 20}}
        />
        <NotificationTopInfo notification={notification}/>
        <View style={{marginVertical: 10}}>
          <FlatButton
            title={I18n.t("common.openInBrowser")}
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
      </View>
    );
  }

  // LIFECYCLE ====================================================================================

  // METHODS ======================================================================================
}

// UTILS ==========================================================================================

// MAPPING ========================================================================================

const TimelineWebViewScreen_Connected = connect(() => ({}), () => ({}))(TimelineWebViewScreen);
export default withViewTracking("timeline/goto")(TimelineWebViewScreen_Connected);
