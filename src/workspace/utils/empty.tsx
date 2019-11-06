import * as React from "react";
import {EmptyScreen} from "../../ui/EmptyScreen";
import I18n from "i18n-js";
import {FilterId} from "../types/filters";
import {FlatList, RefreshControl, StyleSheet, View} from "react-native";
import {CommonStyles} from "../../styles/common/styles";
import {DEVICE_HEIGHT, DEVICE_WIDTH, layoutSize} from "../../styles/common/layoutSize";

const styles = StyleSheet.create({
  mainPanel: {
    backgroundColor: "#FFF6F8",
    flex: 1
  },
});

export const renderEmptyTrash = (): React.ReactNode => {
  return (
    <View style={{ flex: 1, flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
      <EmptyScreen
        imageSrc={require("../../../assets/images/empty-screen/empty-trash.png")}
        imgWidth={265}
        imgHeight={336}
        text={I18n.t("trash-emptyScreenText")}
        title={I18n.t("trash-emptyScreenTitle")}
        scale={0.76}
      />
    </View>
  );
}

export const renderEmptyFolder = (): React.ReactNode => {
  return (
    <View style={{ width: DEVICE_WIDTH(), height: DEVICE_HEIGHT() - layoutSize.LAYOUT_110, justifyContent: 'center', alignItems: 'center'}}>
      <EmptyScreen
        imageSrc={require("../../../assets/images/empty-screen/empty-folder.png")}
        imgWidth={500}
        imgHeight={500}
        text=""
        title=""
        scale={0.7}
      />
    </View>
  );
}

export const renderEmptyWorkspace = (parentId: string): React.ReactNode => {
  const text = parentId === FilterId.owner
    ? I18n.t("owner-emptyScreenText")
    : parentId === FilterId.protected
      ? I18n.t("protected-emptyScreenText")
      : I18n.t("share-emptyScreenText")
  const title = parentId === FilterId.owner
    ? I18n.t("owner-emptyScreenTitle")
    : parentId === FilterId.protected
      ? I18n.t("protected-emptyScreenTitle")
      : I18n.t("share-emptyScreenTitle")

  return (
    <View style={{ flex: 1, flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}>
      <EmptyScreen
        imageSrc={require("../../../assets/images/empty-screen/empty-workspace.png")}
        imgWidth={400}
        imgHeight={316}
        text={text}
        title={title}
        scale={0.76}
      />
    </View>
  );
}

export const renderEmptyList = (parentId: string, onRefresh: () => void): React.ReactNode => {

/*  return parentId === FilterId.trash
    ? renderEmptyTrash()
    : parentId in FilterId
      ? renderEmptyWorkspace(parentId)
      : renderEmptyFolder()
*/
  return (
    <View style={styles.mainPanel}>
        <FlatList
          data={renderEmptyContent(parentId) as any}
          keyExtractor={(item: any) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={onRefresh}
            />
          }
          renderItem={ ({item}) => (item as any).render()}
        />
      </View>
  )
}

export const renderEmptyContent = (parentId: string): React.ReactNode => {

  return parentId === FilterId.trash
    ? [{ id: "1", render: () => renderEmptyTrash()}]
    : parentId in FilterId
      ? [{id: "1", render: () => renderEmptyWorkspace(parentId)}]
      : [{id: "1", render: () => renderEmptyFolder()}]
}
