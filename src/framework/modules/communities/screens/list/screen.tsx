import * as React from 'react';

import { CommunityClient, CommunityResponseDto } from '@edifice.io/community-client-rest-rn';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CommunitiesListScreen } from './types';
import moduleConfig from '../../module-config';

import { I18n } from '~/app/i18n';
import PrimaryButton from '~/framework/components/buttons/primary';
import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
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
  const [communities, setCommunities] = React.useState<CommunityResponseDto[]>([]);
  const fetchData = React.useCallback(() => {
    (async () => {
      const commus = await http.sessionApi(moduleConfig, CommunityClient).getCommunities();
      console.info('COMMUNITIES', commus);
      setCommunities(commus.items);
    })();
  }, []);

  useFocusEffect(fetchData);

  return (
    <PageView>
      <BodyBoldText>communities list screen</BodyBoldText>
      {communities &&
        communities.map(c => (
          <PrimaryButton
            key={c.id}
            text={c.title}
            action={() => navigation.navigate(communitiesRouteNames.home, { communityId: c.id })}
            style={{ marginVertical: 2 }}
          />
        ))}
      {/* <PrimaryButton text="HomeScreen" action={() => navigation.navigate(communitiesRouteNames.home, {})} /> */}
    </PageView>
  );
}
