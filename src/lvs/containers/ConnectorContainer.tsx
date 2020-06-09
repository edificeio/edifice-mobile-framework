import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import I18n from "i18n-js";

import Conf from "../../../ode-framework-conf";
import connectorConfig from "../config";
import userConfig from "../../user/config";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";

import { AppTitle, Header, HeaderIcon } from "../../ui/headers/Header";
import { PageContainer } from "../../ui/ContainerContent";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { Back } from "../../ui/headers/Back";

import ConnectorView from "../components/ConnectorView";
import { openConnector } from "../actions/connector";
import { bindActionCreators } from "redux";
import withViewTracking from "../../infra/tracker/withViewTracking";

interface IApplicationBackend {
  name: string;
  address: string;
  icon: string;
  target: string;
  displayName: string;
  display: boolean;
  prefix: string;
}

interface IConnectorContainerDataProps {
  connectorAddress: string;
  error: string;
  isLoading: boolean;
}

interface IConnectorContainerEventProps {
  openConnector: (connectorAddress: string, successCallback: Function) => void;
}

interface IConnectorContainerNavigationProps {
  navigation?: any;
}

type IConnectorContainerProps = IConnectorContainerDataProps &
  IConnectorContainerEventProps &
  IConnectorContainerNavigationProps;

class ConnectorContainer extends React.PureComponent<IConnectorContainerProps> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    return standardNavScreenOptions(
      {
        header: (
          <Header>
            <Back navigation={navigation} />
            <AppTitle>{I18n.t(connectorConfig.displayName)}</AppTitle>
            <HeaderIcon name={null} hidden={true} />
          </Header>
        ),
      },
      navigation
    );
  };

  public render() {
    return (
      <PageContainer>
        <ConnectionTrackingBar />
        <ConnectorView
          openConnector={() =>
            this.props.openConnector(this.props.connectorAddress, () => this.props.navigation.goBack(null))
          }
          isLoading={this.props.isLoading}
          error={this.props.error}
        />
      </PageContainer>
    );
  }
}

const findLvsConnector: (apps: Array<IApplicationBackend>) => string = apps => {
  const regexp = /la[- ]+vie[- ]+scolaire/i

  for (const app of apps) {
    if (
      app.name.toUpperCase().includes("LVS") ||
      app.displayName.toUpperCase().includes("LVS") ||
      app.address.toUpperCase().includes("LVS") || 
      regexp.test(app.name) ||
      regexp.test(app.displayName) ||
      regexp.test(app.address)
    ) {
      return app.address;
    }
  }
};

const getConnectorAddress: (appAddress: string) => string = (appAddress) =>
  `${Conf.currentPlatform.url}${appAddress}&noRedirect=true`;

const mapStateToProps: (state: any) => IConnectorContainerDataProps = state => {
  const connectorState = connectorConfig.getLocalState(state);
  const authState = userConfig.getLocalState(state).auth;
  return {
    connectorAddress: getConnectorAddress(findLvsConnector(authState.appsInfo)),
    error: connectorState.errmsg,
    isLoading: connectorState.isConnecting,
  };
};

const mapDispatchToProps: (dispatch: any) => IConnectorContainerEventProps = dispatch => {
  return bindActionCreators({ openConnector }, dispatch);
};

export default withViewTracking("lvs")(connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectorContainer));
