import * as React from 'react';
import { PixelRatio, View } from 'react-native';

import { InvitationClient, InvitationResponseDto } from '@edifice.io/community-client-rest-rn';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';
import type { CommunitiesListScreen } from './types';

import { I18n } from '~/app/i18n';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/empty-screens';
import PaginatedList, { LOADING_ITEM_DATA, PaginatedListProps, staleOrSplice } from '~/framework/components/list/paginated-list';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import { sessionScreen } from '~/framework/components/screen';
import { TextSizeStyle } from '~/framework/components/text';
import CommunityCardSmall, { SMALL_CARD_METRICS } from '~/framework/modules/communities/components/community-card-small';
import CommunityCardSmallLoader from '~/framework/modules/communities/components/community-card-small-loader/component';
import moduleConfig from '~/framework/modules/communities/module-config';
import { CommunitiesNavigationParams, communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import http from '~/framework/util/http';

const PAGE_SIZE = 48;

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<CommunitiesNavigationParams, typeof communitiesRouteNames.list>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('communities-list-title'),
  }),
  headerRight: () => <NavBarAction icon="ui-user-join" />,
});

export default sessionScreen<CommunitiesListScreen.AllProps>(function CommunitiesListScreen({ navigation }) {
  const [communities, setCommunities] = React.useState<(InvitationResponseDto | typeof LOADING_ITEM_DATA)[]>([]);

  const loadData = React.useCallback(async (page: number, reloadAll?: boolean) => {
    const newData = await http
      .sessionApi(moduleConfig, InvitationClient)
      .getUserInvitations({ fields: ['stats', 'community'], page: page + 1, size: PAGE_SIZE });
    setCommunities(prevData => {
      const mergedData = staleOrSplice(
        prevData,
        { from: page * PAGE_SIZE, items: newData.items, total: newData.meta.totalItems },
        reloadAll,
      );
      return mergedData;
    });
  }, []);

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
          onPress={() => navigateToCommunityHomePage(item.communityId)}
        />
      ) : null,
    [navigateToCommunityHomePage],
  );

  const renderPlaceholderItem = React.useCallback(() => <CommunityCardSmallLoader />, []);

  const renderItemSeparator = React.useCallback(() => <View style={styles.itemSeparator} />, []);

  const estimatedListSize = React.useMemo(
    () => ({
      height:
        UI_SIZES.screen.height - UI_SIZES.elements.navbarHeight - UI_SIZES.elements.tabbarHeight - UI_SIZES.screen.bottomInset,
      width: UI_SIZES.screen.width,
    }),
    [],
  );

  const estimatedItemSize = React.useMemo(
    () =>
      TextSizeStyle.Medium.lineHeight * PixelRatio.getFontScale() +
      SMALL_CARD_METRICS.imgHeight +
      2 * (SMALL_CARD_METRICS.maxBorderWidth + SMALL_CARD_METRICS.titlePadding),
    [],
  );

  const keyExtractor = React.useCallback<NonNullable<PaginatedListProps<InvitationResponseDto>['keyExtractor']>>(
    (item, index) => (item === LOADING_ITEM_DATA ? 'loading' + index.toString() : item.id.toString()),
    [],
  );

  return (
    <View style={styles.listContainer}>
      <PaginatedList
        data={communities}
        estimatedItemSize={estimatedItemSize}
        estimatedListSize={estimatedListSize}
        ItemSeparatorComponent={renderItemSeparator}
        keyExtractor={keyExtractor}
        ListFooterComponent={<View />}
        ListFooterComponentStyle={{ marginBottom: UI_SIZES.spacing.big }}
        ListHeaderComponent={<View />}
        ListHeaderComponentStyle={{ marginBottom: UI_SIZES.spacing.big }}
        onPageReached={loadData}
        pageSize={PAGE_SIZE}
        renderItem={renderItem}
        renderPlaceholderItem={renderPlaceholderItem}
        ListEmptyComponent={
          <EmptyScreen
            svgImage="empty-timeline"
            title={I18n.get('communities-list-empty-title')}
            text={I18n.get('communities-list-empty-text')}
          />
        }
      />
    </View>
  );
});
