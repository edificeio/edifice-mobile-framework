import * as React from "react";
import { connect } from "react-redux";
import config from "../config";
import { NavigationScreenProp } from "react-navigation";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { bindActionCreators } from "redux";
import { getFolderDocuments } from "../actions/documents";
import { getSubFolders } from "../actions/folders";
import List from "../components/List";
import { View } from "react-native";

const mapStateToProps = state => {
  const documents = config.getLocalState(state).documents.data;
  const folders = config.getLocalState(state).folders.data;
  return { documents, folders };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ getFolderDocuments, getSubFolders }, dispatch);
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

  private refreshScreen = () => {
    this.props.getFolderDocuments(this.props.navigation.getParam("id"));
    this.props.getSubFolders(this.props.navigation.getParam("id"));
  }

  private refreshOnGoBack = this.props.navigation.addListener("didFocus", this.refreshScreen)

  public componentWillUnmount() {
    this.refreshOnGoBack.remove()
  }

  public render() {
    if (this.props.folders || this.props.documents) {
      return (
        <List
          navigate={(id, name) => this.props.navigation.push("FolderView", { id, name })}
          folders={this.props.folders}
          documents={this.props.documents}
        />
      );
    } else {
      <View />;
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContainerList);
