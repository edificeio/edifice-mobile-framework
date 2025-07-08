import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesHomeScreen } from './types';

import { I18n } from '~/app/i18n';
import PrimaryButton from '~/framework/components/buttons/primary';
import { sessionScreen } from '~/framework/components/screen';
import { BodyBoldText } from '~/framework/components/text';
import { CommunitiesNavigationParams, communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<CommunitiesNavigationParams, typeof communitiesRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('communities-home-title'),
  }),
});

export default sessionScreen<CommunitiesHomeScreen.AllProps>(function CommunitiesHomeScreen({ navigation, route, session }) {
  const communityId = route.params.communityId;

  return (
    <>
      <BodyBoldText>communities home screen, ID = {communityId} </BodyBoldText>
      <PrimaryButton
        text={'Go to Documents'}
        action={() => navigation.navigate(communitiesRouteNames.documents, { communityId: communityId })}
      />
      <PrimaryButton
        text={'Go to Members'}
        action={() => navigation.navigate(communitiesRouteNames.members, { communityId: communityId })}
        style={{ marginVertical: 2 }}
      />
    </>
  );
});
