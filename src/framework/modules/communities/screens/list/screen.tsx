import * as React from 'react';

import { CommunityClient } from '@edifice.io/community-client-rest-rn';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesListScreen } from './types';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import { CommunitiesNavigationParams, communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

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

export default function CommunitiesListScreen({}: CommunitiesListScreen.AllProps) {
  const fetchData = React.useCallback(() => {
    console.debug('FETCH');
    const session = getSession();
    if (!session) return;
    const client = new CommunityClient({
      baseUrl: session.platform.url + '/communities',
      defaultHeaders: {
        Authorization: `Bearer ${session.tokens.access.value}`,
      },
    });
    client.getCommunities().then(data => {
      console.info('COMMUNITIES', data);
    });
  }, []);

  useFocusEffect(fetchData);

  return (
    <PageView>
      <BodyBoldText>communities list screen</BodyBoldText>
    </PageView>
  );
}
