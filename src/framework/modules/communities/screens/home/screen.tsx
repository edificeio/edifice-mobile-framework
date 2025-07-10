import * as React from 'react';

import { InvitationResponseDto } from '@edifice.io/community-client-rest-rn';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import type { CommunitiesHomeScreen } from './types';

import { I18n } from '~/app/i18n';
import PrimaryButton from '~/framework/components/buttons/primary';
import { LOADING_ITEM_DATA } from '~/framework/components/list/paginated-list';
import { sessionScreen } from '~/framework/components/screen';
import { BodyBoldText } from '~/framework/components/text';
import { CommunitiesNavigationParams, communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { communitiesSelectors } from '~/framework/modules/communities/store';
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

  const allCommunities = useSelector(communitiesSelectors.getAllCommunities);
  const currentCommunity: InvitationResponseDto | undefined = allCommunities.find(
    community => community !== LOADING_ITEM_DATA && community.communityId === communityId,
  );

  return (
    <>
      <BodyBoldText>communities home screen, ID = {communityId} </BodyBoldText>
      <BodyBoldText>title : {currentCommunity?.community?.title} </BodyBoldText>
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
