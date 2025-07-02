import * as React from 'react';

import { InvitationClient, InvitationResponseDto } from '@edifice.io/community-client-rest-rn';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesListScreen } from './types';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import CommunityCardSmall from '~/framework/modules/communities/components/community-card-small';
import moduleConfig from '~/framework/modules/communities/module-config';
import { CommunitiesNavigationParams, communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import http from '~/framework/util/http';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<CommunitiesNavigationParams, typeof communitiesRouteNames.list>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('communities-list-title'),
  }),
});

export default function CommunitiesListScreen({ navigation }: CommunitiesListScreen.AllProps) {
  const [communities, setCommunities] = React.useState<InvitationResponseDto[]>([]);

  const fetchData = React.useCallback(() => {
    (async () => {
      const data = await http.sessionApi(moduleConfig, InvitationClient).getUserInvitations({ fields: ['stats', 'community'] });
      setCommunities(data.items);
    })();
  }, []);

  useFocusEffect(fetchData);

  const navigateToCommunityHomePage = React.useCallback(
    (communityId: string) => {
      navigation.navigate(communitiesRouteNames.home, { communityId });
    },
    [navigation],
  );

  return (
    // virer align items quand il y aura la liste
    <PageView gutters="both" style={{ alignItems: 'center' }}>
      {communities &&
        communities.map((c: InvitationResponseDto) =>
          c.community ? (
            <CommunityCardSmall
              key={c.id}
              title={c.community.title}
              image={c.community.image}
              invitationStatus={c.status}
              membersCount={c.communityStats?.totalMembers}
              moduleConfig={moduleConfig}
              onPress={() => navigateToCommunityHomePage(String(c.id))}
            />
          ) : undefined,
        )}
    </PageView>
  );
}
