import * as React from "react";
// @ts-ignore’
import I18n from "i18n-js";
import DeviceInfo from 'react-native-device-info';

import { PageContainer } from "../../ui/ContainerContent";
import { EmptyScreen } from "../../ui/EmptyScreen";

import MyAppItem from "./MyAppItem";
import DEPRECATED_ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { IAppModule } from "../../infra/moduleTool/types";
import { View, ScrollView, Linking, Platform } from "react-native";
import withViewTracking from "../../framework/util/tracker/withViewTracking";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { FlatButton } from "../../ui/FlatButton";
import { CommonStyles } from "../../styles/common/styles";
import { InfoBubble } from "../../framework/components/infoBubble";
import { Module } from "../../framework/util/moduleTool";
import { DEPRECATED_getCurrentPlatform } from "~/framework/util/_legacy_appConf";

class MyAppGrid extends React.PureComponent<{ navigation: NavigationScreenProp<NavigationState> }, {}> {
  renderModulesList = (modules: IAppModule[], newModules?: Module[]) => {
    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {modules.map(item => (
          <MyAppItem
            key={item.config.name}
            displayName={I18n.t(item.config.displayName)}
            iconColor={item.config.iconColor}
            iconName={item.config.iconName}
            onPress={() => this.props.navigation.navigate(item.config.name)}
          />
        ))}
        {newModules &&
          newModules.map(item => (
            <MyAppItem
              key={item.config.name}
              displayName={I18n.t(item.config.displayName)}
              iconColor={item.config.iconColor}
              iconName={item.config.iconName}
              onPress={() => this.props.navigation.navigate(item.config.name)}
            />
          ))}
      </View>
    );
  };

  private renderGrid(modules: IAppModule[], newModules?: Module[]) {
    return (
      <ScrollView contentContainerStyle={{justifyContent: "space-between", flexGrow: 1}} >
        {this.renderModulesList(modules, newModules)}
        <View style={{justifyContent: "center", height: 80}}>
          <View style={{height: Platform.OS === "android" ? 40 : undefined}}>
            <FlatButton
              title={I18n.t("myapp-accessWeb")}
              loading={false}
              customButtonStyle={{backgroundColor: undefined, borderColor: CommonStyles.actionColor, borderWidth: 1.5}}
              customTextStyle={{color: CommonStyles.actionColor}}
              onPress={() => {
                if (!DEPRECATED_getCurrentPlatform()) {
                  console.warn("Must have a platform selected to redirect the user");
                  return null;
                }
                const url = `${DEPRECATED_getCurrentPlatform()!.url}/welcome`
                Linking.canOpenURL(url).then(supported => {
                  if (supported) {
                    Linking.openURL(url);
                  } else {
                    console.warn("[my apps] Don't know how to open URI: ", url);
                  }
                });
              }}
            />
            <InfoBubble
              infoText={I18n.t("myapp-infoBubbleText", {appName: DeviceInfo.getApplicationName()})}
              infoTitle={I18n.t("myapp-infoBubbleTitle")}
              infoImage={require("ASSETS/images/my-apps-infobubble.png")}
              infoBubbleType="floating"
              infoBubbleId="myAppsScreen.redirect"
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  private renderEmpty() {
    return (
      <EmptyScreen
        imageSrc={require("ASSETS/images/empty-screen/homework.png")}
        imgWidth={407}
        imgHeight={319}
        text={I18n.t("myapp-emptyScreenText")}
        title={I18n.t("myapp-emptyScreenTitle")}
      />
    );
  }

  public render() {
    let pageContent = null;
    const { modules, newModules } = this.props;

    if (modules.length == 0) {
      pageContent = this.renderEmpty();
    } else {
      pageContent = this.renderGrid(modules, newModules);
    }

    return (
      <PageContainer>
        <DEPRECATED_ConnectionTrackingBar />
        {pageContent}
      </PageContainer>
    );
  }
}

export default withViewTracking('myapps')(MyAppGrid);
