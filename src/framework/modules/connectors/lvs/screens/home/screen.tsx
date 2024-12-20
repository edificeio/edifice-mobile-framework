import * as React from 'react';
import { Alert, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { connect } from 'react-redux';

import type { LvsHomeScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { EmptyConnectionScreen } from '~/framework/components/empty-screens';
import { getSession } from '~/framework/modules/auth/reducer';
import { LvsNavigationParams, lvsRouteNames } from '~/framework/modules/connectors/lvs/navigation';
import redirect from '~/framework/modules/connectors/lvs/service/redirect';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<LvsNavigationParams, typeof lvsRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('lvs-home-title'),
  }),
});

function LvsHomeScreen(props: LvsHomeScreenPrivateProps) {
  const { session } = props;
  const { connector } = props.route.params;
  if (!session) {
    return <EmptyConnectionScreen />;
  } else {
    // Not in useEffect => normal, we want to execute this at first time.
    redirect(session, connector.address).catch(() => {
      Alert.alert(I18n.get('lvs-redirect-error-text'));
    });
    props.navigation.goBack();
    return <View />;
  }
}

export default connect((state: IGlobalState) => ({
  session: getSession(),
}))(LvsHomeScreen);
