import * as React from 'react';
import { Alert, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import type { IGlobalState } from '~/AppStore';
import type { ISession } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import type { IEntcoreApp } from '~/framework/util/moduleTool';
import redirect from '~/modules/pronote/service/redirect';

export interface IConnectorRedirectScreenDataProps {
  session: ISession;
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

  // Not in useEffet => normal, we want to execute this at first time.
  redirect(session, connector.address, pageId).catch(e => {
    Alert.alert('Error' + e);
  });
  props.navigation.goBack(null);

  return <View />;
}

export default connect(
  (state: IGlobalState) => ({
    session: getSession(),
  }),
  (dispatch: ThunkDispatch<any, any, any>) => bindActionCreators({}, dispatch),
)(ConnectorRedirectScreen);
