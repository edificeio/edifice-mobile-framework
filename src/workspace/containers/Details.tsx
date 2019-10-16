import * as React from "react";
import { connect } from "react-redux";
import config from "../config";
import { bindActionCreators } from "redux";
import { NavigationScreenProp } from "react-navigation";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderAction } from "../../ui/headers/NewHeader";
import { View, ViewStyle } from "react-native";
import { IProps, IStateItems } from "../types";
import { fetchWorkspaceList } from "../actions/list";
import { Loading } from "../../ui";



const HeaderBackAction = ({ navigation, style }: {
  navigation: NavigationScreenProp<{}>, style?: ViewStyle
}) => {
  return (
    <HeaderAction onPress={() => navigation.pop()} name={"back"} style={style}/>
  )
}


export class Details extends React.PureComponent<IProps> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    return standardNavScreenOptions(
      {
        title: navigation.getParam("title"),
        headerLeft: <HeaderBackAction navigation={navigation}/>,
      },
      navigation
    );
  };

  public componentDidMount() {
  }

  public render() {
    const { isFetching } = this.props

    if (isFetching)
      return <Loading/>;

    return (
      <View>
      </View>
    )
  }
}

const mapStateToProps = (state: any, props: any) => {
  const stateDetails: IStateItems = config.getLocalState(state).details.data
  const { isFetching } = config.getLocalState(state).details;
  const parentId = props.navigation.getParam("parentId") || "root";

  return { details: stateDetails[parentId] || {}, isFetching };
}


const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({ fetchWorkspaceList }, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Details);

