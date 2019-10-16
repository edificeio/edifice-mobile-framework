import * as React from "react";
import { connect } from "react-redux";
import config from "../config";
import { bindActionCreators } from "redux";
import { NavigationScreenProp } from "react-navigation";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderAction } from "../../ui/headers/NewHeader";
import { FlatList, View, ViewStyle } from "react-native";
import { IItem, IProps, IStateItems } from "../types";
import { Item } from "../components";
import { fetchWorkspaceList } from "../actions/list";
import { Loading } from "../../ui";
import { CommonStyles } from "../../styles/common/styles";
import { layoutSize } from "../../styles/common/layoutSize";


const HeaderBackAction = ({ navigation, style }: {
  navigation: NavigationScreenProp<{}>, style?: ViewStyle
}) => {
  return (
    <HeaderAction onPress={() => navigation.pop()} name={"back"} style={style}/>
  )
};


export class Items extends React.PureComponent<IProps> {
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
    const { items } = this.props;

    if (Object.keys(items).length > 0)   // already read
      return;

    this.props.fetchWorkspaceList(
      {
        filter: this.props.navigation.getParam("filter"),
        parentId: this.props.navigation.getParam("parentId")
      });
  }

  public onPress(parentId: string) {
    const filter = this.props.navigation.getParam("filter") || this.props.items[parentId].filter;
    const title = this.props.items[parentId].name;
    const isFolder = this.props.items[parentId].isFolder;

    isFolder
      ? this.props.navigation.push("Workspace", { filter, parentId, title})
      : this.props.navigation.push("WorkspaceDetails", { filter, parentId, title})
  }

  renderSeparator = () => (
    <View
      style={{
        borderTopColor: CommonStyles.borderColorLighter,
        borderTopWidth: 1,
        marginLeft: layoutSize.LAYOUT_70,
      }}
    />
  );

  public render() {
    const { items, isFetching } = this.props;

    if (isFetching)
      return <Loading/>;

    return (
      <View>
        <FlatList
          data={Object.values(items)}
          ItemSeparatorComponent={this.renderSeparator}
          keyExtractor={(item: IItem) => item.id}
          renderItem={({ item }) => <Item {...item} onPress={this.onPress.bind(this)}/>}
        />
      </View>
    )
  }
}

const mapStateToProps = (state: any, props: any) => {
  const stateItems: IStateItems = config.getLocalState(state).items.data;
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

