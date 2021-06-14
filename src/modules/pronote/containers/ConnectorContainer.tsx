import I18n from "i18n-js";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";

import Conf from "../../../../ode-framework-conf";
import connectorConfig from "../moduleConfig";
import userConfig from "../../../user/config";
import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";

import { AppTitle, Header, HeaderIcon } from "../../../ui/headers/Header";
import { PageContainer } from "../../../ui/ContainerContent";
import DEPRECATED_ConnectionTrackingBar from "../../../ui/ConnectionTrackingBar";
import { Back } from "../../../ui/headers/Back";

import ConnectorView from "../components/ConnectorView";
import { openConnector } from "../actions/connector";
import { bindActionCreators } from "redux";
import withViewTracking from "../../../infra/tracker/withViewTracking";

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
            <AppTitle>{I18n.t("Pronote")}</AppTitle>
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
        <DEPRECATED_ConnectionTrackingBar />
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

const findPronoteConnector: (apps: Array<IApplicationBackend>) => string = apps => {
  for (const app of apps) {
    if (
      app.name.toUpperCase().includes("PRONOTE") ||
      app.displayName.toUpperCase().includes("PRONOTE") ||
      app.address.toUpperCase().includes("PRONOTE")
    ) {
      return app.address;
    }
  }
};

const profileMap = {
  TEACHER: "professeur",
  STUDENT: "eleve",
  RELATIVE: "parent",
  PERSONNEL: "direction",
};

const getConnectorAddress: (appAddress: string, userType: string) => string = (appAddress, userType) => {

  const getSlash = link => {
    let service = decodeURIComponent(link)
    return service.charAt(service.length - 1) == '/' ? "" : '%2F'
  }

  let link = `${Conf.currentPlatform.url}/cas/oauth/login?service=${encodeURIComponent(appAddress)}`;
  const role = profileMap[userType.toUpperCase()];
  link += `${getSlash(link)}mobile.${role}.html`;
  return link
}

const mapStateToProps: (state: any) => IConnectorContainerDataProps = state => {
  const connectorState = connectorConfig.getState(state);
  const authState = userConfig.getLocalState(state).auth;
  const infoState = userConfig.getLocalState(state).info;
  return {
    connectorAddress: getConnectorAddress(findPronoteConnector(authState.appsInfo), infoState.type),
    error: connectorState.errmsg,
    isLoading: connectorState.isConnecting,
  };
};

const mapDispatchToProps: (dispatch: any) => IConnectorContainerEventProps = dispatch => {
  return bindActionCreators({ openConnector }, dispatch);
};

export default withViewTracking("pronote")(connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectorContainer));
