import I18n from 'i18n-js';
import * as React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { openConnector } from '~/modules/pronote/actions/connector';
import ConnectorView from '~/modules/pronote/components/ConnectorView';
import connectorConfig from '~/modules/pronote/moduleConfig';
import userConfig from '~/user/config';
import { PageView } from '~/framework/components/page';
import { HeaderBackAction } from '~/framework/components/header';

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

type IConnectorContainerProps = IConnectorContainerDataProps & IConnectorContainerEventProps & NavigationInjectedProps;

class ConnectorContainer extends React.PureComponent<IConnectorContainerProps> {

  public render() {
    return (
      <PageView
        path={this.props.navigation.state.routeName}
        navBar={{
          left: <HeaderBackAction navigation={this.props.navigation} />,
          title: I18n.t('Pronote'),
        }}>
        <ConnectorView
          openConnector={() => this.props.openConnector(this.props.connectorAddress, () => this.props.navigation.goBack(null))}
          isLoading={this.props.isLoading}
          error={this.props.error}
        />
      </PageView>
    );
  }
}

const findPronoteConnector: (apps: IApplicationBackend[]) => string = apps => {
  for (const app of apps) {
    if (
      app.name.toUpperCase().includes('PRONOTE') ||
      app.displayName.toUpperCase().includes('PRONOTE') ||
      app.address.toUpperCase().includes('PRONOTE')
    ) {
      return app.address;
    }
  }
};

const profileMap = {
  TEACHER: 'professeur',
  STUDENT: 'eleve',
  RELATIVE: 'parent',
  PERSONNEL: 'direction',
};

const getConnectorAddress: (appAddress: string, userType: string) => string = (appAddress, userType) => {
  const getSlash = link => {
    const service = decodeURIComponent(link);
    return service.charAt(service.length - 1) == '/' ? '' : '%2F';
  };

  let link = `${DEPRECATED_getCurrentPlatform()!.url}/cas/oauth/login?service=${encodeURIComponent(appAddress)}`;
  const role = profileMap[userType.toUpperCase()];
  link += `${getSlash(link)}mobile.${role}.html`;
  return link;
};

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

export default withViewTracking('pronote')(connect(mapStateToProps, mapDispatchToProps)(ConnectorContainer));
