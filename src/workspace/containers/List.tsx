import * as React from "react";
import { connect } from "react-redux";
import config from "../config";
import { NavigationScreenProp } from "react-navigation";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { bindActionCreators } from "redux";
import { getDocuments } from "../actions/documents";
import { getFolders } from "../actions/folders";
import List from "../components/List";
import { View } from "react-native";

const mapStateToProps = state => {
  const documents = config.getLocalState(state).documents.data;
  const folders = config.getLocalState(state).folders.data;
  return { documents, folders };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ getDocuments, getFolders }, dispatch);
};

class ContainerList extends React.PureComponent<any, {}> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    return standardNavScreenOptions(
      {
        title: "Page",
      },
      navigation
    );
  };

  public componentDidMount() {
    this.props.getDocuments();
    this.props.getFolders();
  }

  public render() {
    if (this.props.folders || this.props.documents) {
      return <List folders={this.props.folders} documents={this.props.documents} />;
    } else {
      <View />;
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContainerList);
