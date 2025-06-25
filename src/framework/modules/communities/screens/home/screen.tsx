import * as React from 'react';

import { CommunityClient } from '@edifice.io/community-client-rest';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesHomeScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
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

export default function CommunitiesHomeScreen(props: CommunitiesHomeScreenPrivateProps) {
  React.useEffect(() => {
    (async () => {
      const session = getSession();
      if (!session) return;
      const client = new CommunityClient({
        baseUrl: session.platform.url,
        defaultHeaders: {
          Authorization: `Bearer ${session.tokens.access.value}`,
        },
      });
      const communities = await client.getCommunities();
      console.info('COMMUNITIES', communities);
    })();
  }, []);

  return (
    <PageView>
      <BodyBoldText>communities home screen</BodyBoldText>
    </PageView>
  );
}
