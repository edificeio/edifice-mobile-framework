import { createStackNavigator } from "react-navigation-stack";

import ConnectorContainer from "./containers/ConnectorContainer";

export default () =>
  createStackNavigator({
    Connector: ConnectorContainer
  });
