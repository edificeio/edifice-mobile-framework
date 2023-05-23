import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { Alert, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import type { IGlobalState } from '~/app/store';
import { EmptyConnectionScreen } from '~/framework/components/emptyConnectionScreen';
import type { ISession } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { PronoteNavigationParams, pronoteRouteNames } from '~/framework/modules/pronote/navigation';
import redirect from '~/framework/modules/pronote/service/redirect';
import { navBarOptions } from '~/framework/navigation/navBar';
import type { IEntcoreApp } from '~/framework/util/moduleTool';

export interface IConnectorRedirectScreenDataProps {
  session?: ISession;
}

export interface IConnectorRedirectScreenNavigationParams {
  connector: IEntcoreApp;
  pageId?: string;
}

export type IConnectorRedirectScreenProps = NativeStackScreenProps<
  PronoteNavigationParams,
  typeof pronoteRouteNames.connectorRedirect
> &
  IConnectorRedirectScreenDataProps;

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PronoteNavigationParams, typeof pronoteRouteNames.connectorRedirect>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('pronote-home-title'),
  }),
});

function ConnectorRedirectScreen(props: IConnectorRedirectScreenProps) {
  const { session } = props;
  const connector = props.route.params.connector;
  const pageId = props.route.params.pageId;

  if (!session) {
    return <EmptyConnectionScreen />;
  } else {
    // Not in useEffet => normal, we want to execute this at first time.
    redirect(session, connector.address, pageId).catch(e => {
      Alert.alert('Error' + e);
    });
    props.navigation.goBack();
    return <View />;
  }
}

export default connect(
  (state: IGlobalState) => ({
    session: getSession(),
  }),
  (dispatch: ThunkDispatch<any, any, any>) => bindActionCreators({}, dispatch),
)(ConnectorRedirectScreen);
