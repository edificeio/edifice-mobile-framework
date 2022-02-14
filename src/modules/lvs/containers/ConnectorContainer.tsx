import I18n from 'i18n-js';
import * as React from 'react';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { openConnector } from '~/modules/lvs/actions/connector';
import ConnectorView from '~/modules/lvs/components/ConnectorView';
import connectorConfig from '~/modules/lvs/moduleConfig';
import { standardNavScreenOptions } from '~/navigation/helpers/navScreenOptions';
import DEPRECATED_ConnectionTrackingBar from '~/ui/ConnectionTrackingBar';
import { PageContainer } from '~/ui/ContainerContent';
import { Back } from '~/ui/headers/Back';
import { AppTitle, Header, HeaderIcon } from '~/ui/headers/Header';
import userConfig from '~/user/config';

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

type IConnectorContainerProps = IConnectorContainerDataProps & IConnectorContainerEventProps & IConnectorContainerNavigationProps;

class ConnectorContainer extends React.PureComponent<IConnectorContainerProps> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return standardNavScreenOptions(
      {
        header: (
          <Header>
            <Back navigation={navigation} />
            <AppTitle>{I18n.t(connectorConfig.displayName)}</AppTitle>
            <HeaderIcon name={null} hidden />
          </Header>
        ),
      },
      navigation,
    );
  };

  public render() {
    return (
      <PageContainer>
        <DEPRECATED_ConnectionTrackingBar />
        <ConnectorView
          openConnector={() => this.props.openConnector(this.props.connectorAddress, () => this.props.navigation.goBack(null))}
          isLoading={this.props.isLoading}
          error={this.props.error}
        />
      </PageContainer>
    );
  }
}

const findLvsConnector: (apps: IApplicationBackend[]) => string = apps => {
  const regexp = /la[- ]+vie[- ]+scolaire/i;

  for (const app of apps) {
    if (
      app.name.toUpperCase().includes('LVS') ||
      app.displayName.toUpperCase().includes('LVS') ||
      app.address.toUpperCase().includes('LVS') ||
      regexp.test(app.name) ||
      regexp.test(app.displayName) ||
      regexp.test(app.address)
    ) {
      return app.address;
    }
  }
};

const getConnectorAddress: (appAddress: string) => string = appAddress =>
  `${DEPRECATED_getCurrentPlatform()!.url}${appAddress}&noRedirect=true`;

const mapStateToProps: (state: any) => IConnectorContainerDataProps = state => {
  const connectorState = connectorConfig.getState(state);
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

export default withViewTracking('lvs')(connect(mapStateToProps, mapDispatchToProps)(ConnectorContainer));
