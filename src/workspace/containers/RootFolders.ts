import * as React from "react";
import config from "../config";
import { NavigationScreenProp } from "react-navigation";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { Filters } from "../types/entity";

export default class RootListContainer extends React.PureComponent<any, { rootFolders: {} }> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    return standardNavScreenOptions(
      {
        title: config.displayName,
      },
      navigation
    );
  };

  public componentDidMount() {
    this.setState({ rootFolders: this.getRootFolders() });
  }

  private getRootFolders = () => {
    const result = {};
    for (const rootFolder in Filters) {
      //           result[rootFolder] = { id: rootFolder, name: I18n.t(rootFolder) };
    }
    return result;
  };

  public render() {
//        return <List folders={this.state.rootFolders} />;
    return null;
  }
}