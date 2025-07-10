import * as React from 'react';
import { View } from 'react-native';

import { InvitationClient, InvitationResponseDto } from '@edifice.io/community-client-rest-rn';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';
import type { CommunitiesListScreen } from './types';

import { I18n } from '~/app/i18n';
import { UI_SIZES } from '~/framework/components/constants';
import PaginatedList from '~/framework/components/list/paginated-list';
import { PageView } from '~/framework/components/page';
import CommunityCardSmall from '~/framework/modules/communities/components/community-card-small';
import CommunityCardSmallLoader from '~/framework/modules/communities/components/community-card-small-loader/component';
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
    (communityId: number) => {
      navigation.navigate(communitiesRouteNames.home, { communityId });
    },
    [navigation],
  );

  const renderItem = React.useCallback(
    ({ item }: { item: InvitationResponseDto }) =>
      item.community ? (
        <CommunityCardSmall
          key={item.id}
          title={item.community.title}
          image={item.community.image}
          invitationStatus={item.status}
          membersCount={item.communityStats?.totalMembers}
          moduleConfig={moduleConfig}
          onPress={() => navigateToCommunityHomePage(item.id)}
        />
      ) : null,
    [navigateToCommunityHomePage],
  );

  const renderPlaceholderItem = React.useCallback(() => <CommunityCardSmallLoader />, []);

  const renderItemSeparator = React.useCallback(() => <View style={styles.itemSeparator} />, []);

  return (
    <PageView gutters="both">
      <PaginatedList
        data={communities}
        estimatedItemSize={UI_SIZES.elements.communities.cardSmallHeight}
        ItemSeparatorComponent={renderItemSeparator}
        pageSize={20}
        renderItem={renderItem}
        renderPlaceholderItem={renderPlaceholderItem}
      />
    </PageView>
  );
}
