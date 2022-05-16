import * as React from 'react';
import { Alert, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import { IEntcoreApp } from '~/framework/util/moduleTool';
import { IUserSession, getUserSession } from '~/framework/util/session';

import redirect from '../service/redirect';

export interface IConnectorRedirectScreenDataProps {
  session: IUserSession;
}

export interface IConnectorRedirectScreenNavigationParams {
  connector: IEntcoreApp;
  pageId?: string;
}

export type IConnectorRedirectScreenProps = NavigationInjectedProps<IConnectorRedirectScreenNavigationParams> &
  IConnectorRedirectScreenDataProps;

function ConnectorRedirectScreen(props: IConnectorRedirectScreenProps) {
  const { session } = props;
  const connector = props.navigation.getParam('connector');
  const pageId = props.navigation.getParam('pageId');
  React.useEffect(() => {
    redirect(session, connector.address, pageId).catch(e => {
      console.warn(e);
      Alert.alert('Error' + e);
    });
    props.navigation.goBack(null);
  });
  return <View />;
}

export default connect(
  (state: IGlobalState) => ({
    session: getUserSession(),
  }),
  (dispatch: ThunkDispatch<any, any, any>) => bindActionCreators({}, dispatch),
)(ConnectorRedirectScreen);
