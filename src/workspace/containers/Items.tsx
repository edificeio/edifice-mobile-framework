import * as React from "react";
import {FlatList, RefreshControl, StyleSheet, View, ViewStyle} from "react-native";
import { connect } from "react-redux";
import I18n from "i18n-js";
import { bindActionCreators } from "redux";
import { NavigationScreenProp } from "react-navigation";
import config from "../config";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderAction } from "../../ui/headers/NewHeader";
import {EVENT_TYPE, IItem, IItemsProps, IState} from "../types";
import { Item } from "../components";
import { fetchWorkspaceList } from "../actions/list";
import { CommonStyles } from "../../styles/common/styles";
import { layoutSize } from "../../styles/common/layoutSize";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import {renderEmptyList} from "../utils/empty";


const styles = StyleSheet.create({
  mainPanel: {
    backgroundColor: CommonStyles.lightGrey,
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

  private sortItems( a: IItem, b: IItem): number {
    return a.isFolder
      ? b.isFolder
        ? a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        : -1
      : b.isFolder
        ? 1
        : a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  }

  public render(): React.ReactNode {
    const { items, isFetching } = this.props;
    const itemsArray = Object.values(items).sort((a, b) => this.sortItems(a, b));
    const parentId = this.props.navigation.getParam("parentId") || null;

    if (!isFetching && itemsArray.length === 0)
      return renderEmptyList(parentId, this.makeRequest.bind(this));

    return (
      <View style={styles.mainPanel}>
        <ConnectionTrackingBar />
        <View style={styles.endSeparator}>
          <FlatList
            data={itemsArray}
            ItemSeparatorComponent={() => <View style={styles.separator}/>}
            keyExtractor={(item: IItem) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={isFetching}
                onRefresh={this.makeRequest.bind(this)}
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

