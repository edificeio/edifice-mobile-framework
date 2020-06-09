import * as React from "react";
// @ts-ignore’
import I18n from "i18n-js";

import { PageContainer } from "../../ui/ContainerContent";
import { EmptyScreen } from "../../ui/EmptyScreen";

import MyAppItem from "./MyAppItem";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { IAppModule } from "../../infra/moduleTool/types";
import { View, ScrollView } from "react-native";
import withViewTracking from "../../infra/tracker/withViewTracking";
import { NavigationScreenProp, NavigationState } from "react-navigation";

class MyAppGrid extends React.PureComponent<{ navigation : NavigationScreenProp<NavigationState>}, {}> {
  private renderGrid(modules: IAppModule[]) {
    return (
      <ScrollView>
        <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>
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
