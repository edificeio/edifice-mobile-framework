import * as React from "react";
import { connect } from "react-redux";
import config from "../config";
import { bindActionCreators } from "redux";
import { NavigationScreenProp } from "react-navigation";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderAction } from "../../ui/headers/NewHeader";
import { FlatList, View, ViewStyle } from "react-native";
import { FilterId, IEntity, IProps, IStateWorkspace } from "../types/entity";
import { Entity } from "../components";
import { fetchWorkspaceList } from "../actions/list";
import { Loading } from "../../ui";
import { CommonStyles } from "../../styles/common/styles";
import { layoutSize } from "../../styles/common/layoutSize";
import { filters } from "../types/filters";


const HeaderBackAction = ({ navigation, style }: {
  navigation: NavigationScreenProp<{}>, style?: ViewStyle
}) => {
  const filter = navigation.getParam("filter")
  const parentId = navigation.getParam("backId")

  return (
    <HeaderAction onPress={() => navigation.pop()} name={"back"} style={style}/>
  )
}


export class List extends React.PureComponent<IProps, {}> {
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
    const { filesFolders } = this.props

    if (Object.keys(filesFolders).length > 0)   // already read
      return

    this.props.fetchWorkspaceList(
      {
        filter: this.props.navigation.getParam("filter"),
        parentId: this.props.navigation.getParam("parentId")
      });
  }

  public onPress(parentId: string) {
    const filter = this.props.navigation.getParam("filter") || this.props.filesFolders[parentId].filter
    const title = this.props.filesFolders[parentId].name

    this.props.navigation.push("Workspace", { filter, parentId, title})
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
    const { filesFolders, isFetching } = this.props

    if (isFetching)
      return <Loading/>;

    return (
      <View>
        <FlatList
          data={Object.values(filesFolders)}
          ItemSeparatorComponent={this.renderSeparator}
          keyExtractor={(item: IEntity) => item.id}
          renderItem={({ item }) => <Entity {...item} onPress={this.onPress.bind(this)}/>}
        />
      </View>
    )
  }
}

const mapStateToProps = (state: any, props: any) => {
  const stateWorkspace: IStateWorkspace = config.getLocalState(state).workspace.data
  const { isFetching } = config.getLocalState(state).workspace;
  const parentId = props.navigation.getParam("parentId") || "root";

  return { filesFolders: stateWorkspace[parentId] || {}, isFetching };
}


const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({ fetchWorkspaceList }, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List);

