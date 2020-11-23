import * as React from "react";
// @ts-ignore’
import I18n from "i18n-js";
import DeviceInfo from 'react-native-device-info';

import { PageContainer } from "../../ui/ContainerContent";
import { EmptyScreen } from "../../ui/EmptyScreen";

import MyAppItem from "./MyAppItem";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { IAppModule } from "../../infra/moduleTool/types";
import { View, ScrollView, Linking } from "react-native";
import withViewTracking from "../../infra/tracker/withViewTracking";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { FlatButton } from "../../ui/FlatButton";
import { CommonStyles } from "../../styles/common/styles";
import { InfoBubble } from "../../ui/InfoBubble";
import Conf from "../../../ode-framework-conf";

class MyAppGrid extends React.PureComponent<{ navigation : NavigationScreenProp<NavigationState>}, {}> {
  private renderGrid(modules: IAppModule[]) {
    return (
      <ScrollView contentContainerStyle={{justifyContent: "space-between", flexGrow: 1}} >
        <View style={{flexDirection: "row", flexWrap: "wrap"}}>
          {modules.map(item => (
            <MyAppItem
              key={item.config.name}
              displayName={I18n.t(item.config.displayName)}
              iconColor={item.config.iconColor}
              iconName={item.config.iconName}
              onPress={() => this.props.navigation.navigate(item.config.name)}
            />
          ))}
        </View>
        <View style={{justifyContent: "center", height: 80}}>
          <View>
            <FlatButton
              title={I18n.t("myapp-accessWeb")}
              loading={false}
              customButtonStyle={{backgroundColor: undefined, borderColor: CommonStyles.actionColor, borderWidth: 1.5}}
              customTextStyle={{color: CommonStyles.actionColor}}
              onPress={() => {
                if (!Conf.currentPlatform) {
                  console.warn("Must have a platform selected to redirect the user");
                  return null;
                }
                const url = `${(Conf.currentPlatform as any).url}/welcome`
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
              infoImage={require("../../../assets/images/my-apps-infobubble.png")}
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  private renderEmpty() {
    return (
      <EmptyScreen
        imageSrc={require("../../../assets/images/empty-screen/homework.png")}
        imgWidth={407}
        imgHeight={319}
        text={I18n.t("myapp-emptyScreenText")}
        title={I18n.t("myapp-emptyScreenTitle")}
      />
    );
  }

  public render() {
    let pageContent = null;
    const { modules } = this.props;

    if (modules.length == 0) {
      pageContent = this.renderEmpty();
    } else {
      pageContent = this.renderGrid(modules);
    }

    return (
      <PageContainer>
        <ConnectionTrackingBar />
        {pageContent}
      </PageContainer>
    );
  }
}

export default withViewTracking('myapps')(MyAppGrid);
