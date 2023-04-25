import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { Alert, View } from 'react-native';
import { connect } from 'react-redux';

import { IGlobalState } from '~/app/store';
import { EmptyConnectionScreen } from '~/framework/components/emptyConnectionScreen';
import { getSession } from '~/framework/modules/auth/reducer';
import { LvsNavigationParams, lvsRouteNames } from '~/framework/modules/connectors/lvs/navigation';
import redirect from '~/framework/modules/connectors/lvs/service/redirect';
import { navBarOptions } from '~/framework/navigation/navBar';

import type { LvsHomeScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<LvsNavigationParams, typeof lvsRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.t('lvs.tabName'),
  }),
});

function LvsHomeScreen(props: LvsHomeScreenPrivateProps) {
  const { session } = props;
  const { connector } = props.route.params;
  if (!session) {
    return <EmptyConnectionScreen />;
  } else {
    // Not in useEffect => normal, we want to execute this at first time.
    redirect(session, connector.address).catch(e => {
      Alert.alert('Error' + e);
    });
    props.navigation.goBack();
    return <View />;
  }
}

export default connect((state: IGlobalState) => ({
  session: getSession(),
}))(LvsHomeScreen);
