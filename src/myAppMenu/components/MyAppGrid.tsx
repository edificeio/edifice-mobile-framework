import * as React from "react";
import { FlatList } from "react-native";
import I18n from "i18n-js";

import { PageContainer } from "../../ui/ContainerContent";
import { EmptyScreen } from "../../ui/EmptyScreen";

import MyAppItem from "./MyAppItem";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { IAppModule } from "../../infra/moduleTool";

class MyAppGrid extends React.PureComponent<any, {}> {
  private renderGrid(modules: IAppModule[]) {
    return (
      <FlatList
        data={modules}
        contentContainerStyle={{ alignContent: "stretch" }}
        renderItem={({ item }: any) => (
          <MyAppItem displayName={I18n.t(item.config.displayName)} iconName={item.config.iconName} onPress={() => this.props.navigation.navigate(item.config.name)} />
        )}
        keyExtractor={(item: IAppModule) => item.config.name}
        numColumns={2}
      />
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

export default MyAppGrid;
