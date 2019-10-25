import * as React from "react";
import { connect } from "react-redux";
import config from "../config";
import { bindActionCreators } from "redux";
import { NavigationScreenProp } from "react-navigation";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderAction } from "../../ui/headers/NewHeader";
import {FlatList, RefreshControl, StyleSheet, View, ViewStyle} from "react-native";
import {EVENT_TYPE, FilterId, IItem, IItemsProps, IState} from "../types";
import { Item } from "../components";
import { fetchWorkspaceList } from "../actions/list";
import { CommonStyles } from "../../styles/common/styles";
import { layoutSize } from "../../styles/common/layoutSize";
import {EmptyScreen} from "../../ui/EmptyScreen";
import I18n from "i18n-js";


const styles = StyleSheet.create({
  mainPanel: {
    backgroundColor: "#FFF6F8",
    flex: 1
  },
  separator: {
    borderBottomColor: CommonStyles.borderColorLighter,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginLeft: layoutSize.LAYOUT_84
  },
  endSeparator: {
    borderBottomColor: CommonStyles.borderColorLighter,
    borderBottomWidth: StyleSheet.hairlineWidth,
  }
});


const HeaderBackAction = ({ navigation, style }: {
  navigation: NavigationScreenProp<{}>, style?: ViewStyle
}) => {
  return (
    <HeaderAction onPress={() => navigation.pop()} name={"back"} style={style}/>
  )
};


export class Items extends React.PureComponent<IItemsProps> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    return standardNavScreenOptions(
      {
        title: navigation.getParam("title") || "Workspace",
        headerLeft: <HeaderBackAction navigation={navigation}/>,
      },
      navigation
    );
  };

  public componentDidMount() {
    this.makeRequest();
  }

  public makeRequest() {
    this.props.fetchWorkspaceList(
      {
        filter: this.props.navigation.getParam("filter"),
        parentId: this.props.navigation.getParam("parentId")
      });
  }

  public onEvent(type: EVENT_TYPE, item: IItem) {
    const { id: parentId, name: title, isFolder } = item;

    switch (type) {
      case EVENT_TYPE.SELECT:
        const filter = this.props.navigation.getParam("filter") || parentId;

        isFolder
          ? this.props.navigation.push("Workspace", { filter, parentId, title })
          : this.props.navigation.push("WorkspaceDetails", { item, title })
        return
    }
  }

  public renderEmptyScreen(): React.ReactNode {
    const parentId = this.props.navigation.getParam("parentId");

    return parentId === FilterId.trash
      ? this.renderEmptyTrash()
      : parentId in FilterId
        ? this.renderEmptyWorkspace()
        : this.renderEmptyFolder()
  }

  public renderEmptyTrash(): React.ReactNode {
    return (
      <EmptyScreen
        imageSrc={require("../../../assets/images/empty-screen/empty-trash.png")}
        imgWidth={265}
        imgHeight={336}
        text={I18n.t("trash-emptyScreenText")}
        title={I18n.t("trash-emptyScreenTitle")}
        scale={0.76}
      />
    );
  }

  public renderEmptyFolder(): React.ReactNode {
    return (
      <EmptyScreen
        imageSrc={require("../../../assets/images/empty-screen/empty-folder.png")}
        imgWidth={500}
        imgHeight={500}
        text=""
        title=""
        scale={0.7}
      />
    );
  }

  public renderEmptyWorkspace(): React.ReactNode {
    const parentId = this.props.navigation.getParam("parentId");
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
      <EmptyScreen
        imageSrc={require("../../../assets/images/empty-screen/empty-workspace.png")}
        imgWidth={400}
        imgHeight={316}
        text={text}
        title={title}
        scale={0.76}
      />
    );
  }

  public render(): React.ReactNode {
    const { items, isFetching } = this.props;
    const itemsArray = Object.values(items);

    if (!isFetching && itemsArray.length === 0)
      return this.renderEmptyScreen();

    return (
      <View style={styles.mainPanel}>
        <View style={styles.endSeparator}>
          <FlatList
            data={itemsArray}
            ItemSeparatorComponent={() => <View style={styles.separator}/>}
            keyExtractor={(item: IItem) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={isFetching}
                onRefresh={this.makeRequest}
              />
            }
            renderItem={({ item }) => <Item {...item} onEvent={this.onEvent.bind(this)}/>}
          />
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state: any, props: any) => {
  const stateItems: IState = config.getLocalState(state).items.data;
  const { isFetching } = config.getLocalState(state).items;
  const parentId = props.navigation.getParam("parentId") || "root";

  return { items: stateItems[parentId] || {}, isFetching };
};


const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({ fetchWorkspaceList }, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Items);

