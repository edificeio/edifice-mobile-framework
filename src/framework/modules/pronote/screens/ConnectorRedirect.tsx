import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import { EmptyConnectionScreen } from '~/framework/components/emptyConnectionScreen';
import { ISession } from '~/framework/modules/auth/model';
import { navBarOptions } from '~/framework/navigation/navBar';
import { IEntcoreApp } from '~/framework/util/moduleTool';
import redirect from '~/modules/pronote/service/redirect';

import { getSession } from '../../auth/reducer';
import { PronoteNavigationParams, pronoteRouteNames } from '../navigation';

export interface IConnectorRedirectScreenDataProps {
  session?: ISession;
}

export interface IConnectorRedirectScreenNavigationParams {
  connector: IEntcoreApp;
  pageId?: string;
}

export type IConnectorRedirectScreenProps = NavigationInjectedProps<IConnectorRedirectScreenNavigationParams> &
  IConnectorRedirectScreenDataProps;

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PronoteNavigationParams, typeof pronoteRouteNames.connectorRedirect>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('pronote-home-title'),
});

function ConnectorRedirectScreen(props: IConnectorRedirectScreenProps) {
  const { session } = props;
  const connector = props.navigation.getParam('connector');
  const pageId = props.navigation.getParam('pageId');

  if (!session) {
    return <EmptyConnectionScreen />;
  } else {
    // Not in useEffet => normal, we want to execute this at first time.
    redirect(session, connector.address, pageId).catch(e => {
      Alert.alert('Error' + e);
    });
    props.navigation.goBack(null);
    return <View />;
  }
}

export default connect(
  (state: IGlobalState) => ({
    session: getSession(state),
  }),
  (dispatch: ThunkDispatch<any, any, any>) => bindActionCreators({}, dispatch),
)(ConnectorRedirectScreen);
