import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { connect } from 'react-redux';

import { IGlobalState } from '~/app/store';
import { LineButton } from '~/framework/components/buttons/line';
import { PageView } from '~/framework/components/page';
import { authRouteNames } from '~/framework/modules/auth/navigation';
import { getSession } from '~/framework/modules/auth/reducer';
import { UserNavigationParams, userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

import type { UserMulticomptePagesScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<UserNavigationParams, typeof userRouteNames.multicomptePages>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: 'UI du multicompte',
  }),
});

function UserMulticomptePagesScreen(props: UserMulticomptePagesScreenPrivateProps) {
  const { session } = props;
  const userOne = {
    avatar: new Blob(),
    id: session?.user.id,
    name: session?.user.displayName,
    type: session?.user.type,
    selected: true,
  };
  const userTwo = {
    avatar: new Blob(),
    id: '123',
    name: 'Secondary Account',
    type: 'Teacher',
    selected: false,
  };

  return (
    <PageView>
      <LineButton
        title="AccountSelectionScreen"
        textStyle={{ color: 'blue' }}
        onPress={() => {
          props.navigation.navigate(authRouteNames.accountSelection, {});
        }}
      />
      <LineButton
        title="UserHomeScreen (1 user, no multi-account rights)"
        textStyle={{ color: 'blue' }}
        onPress={() => {
          props.navigation.navigate(userRouteNames.home, { data: undefined });
        }}
      />
      <LineButton
        title="UserHomeScreen (1 user)"
        textStyle={{ color: 'blue' }}
        onPress={() => {
          props.navigation.navigate(userRouteNames.home, { data: [userOne] });
        }}
      />
      <LineButton
        title="UserHomeScreen (2 users)"
        textStyle={{ color: 'blue' }}
        onPress={() => {
          props.navigation.navigate(userRouteNames.home, { data: [userOne, userTwo] });
        }}
      />
    </PageView>
  );
}

export default connect((state: IGlobalState) => {
  return {
    session: getSession(),
  };
}, null)(UserMulticomptePagesScreen);
