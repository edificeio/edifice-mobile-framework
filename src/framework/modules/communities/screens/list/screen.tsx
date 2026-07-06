import * as React from 'react';
import { View } from 'react-native';

import {
  CommunityType,
  InvitationClient,
  InvitationFields,
  InvitationStatus,
  SearchInvitationDto,
} from '@edifice.io/community-client-rest-rn';
import { InvitationResponseDtoWithThumbnails } from '@edifice.io/community-client-rest-rn/utils';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FlashListRef } from '@shopify/flash-list';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { LOADING_ITEM_DATA, PaginatedFlashList, PaginatedFlashListProps } from '~/framework/components/list/paginated-list';
import { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { sessionScreen } from '~/framework/components/screen';
import { SegmentedControlLoader } from '~/framework/components/segmented-control';
import CommunityCardSmall from '~/framework/modules/communities/components/community-card-small';
import CommunityCardSmallLoader from '~/framework/modules/communities/components/community-card-small/community-card-small-loader';
import CommunityListFilters, { styles as filtersStyles } from '~/framework/modules/communities/components/community-list-filters';
import { CommunityListFilterButtonLoader } from '~/framework/modules/communities/components/community-list-filters/community-list-filter-button';
import ListFiltersBottomSheet from '~/framework/modules/communities/components/community-list-filters/list-filters-bottom-sheet';
import moduleConfig from '~/framework/modules/communities/module-config';
import { CommunitiesNavigationParams, communitiesRouteNames } from '~/framework/modules/communities/navigation';
import {
  CommunitiesAction,
  communitiesActions,
  communitiesActionTypes,
  communitiesSelectors,
} from '~/framework/modules/communities/store';
import { getItemSeparatorStyle } from '~/framework/modules/communities/utils';
import { navBarOptions } from '~/framework/navigation/navBar';
import { toURISource } from '~/framework/util/media';
import { accountApi } from '~/framework/util/transport';

import styles from './styles';
import type { CommunitiesListScreen } from './types';

export const AVAILABLE_FILTERS = [CommunityType.CLASS, CommunityType.FREE];
const INVITATION_FIELDS: InvitationFields[] = ['stats', 'community'];
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
  // headerRight: () => <NavBarAction icon="ui-user-join" />,
});

const emptyData = [];

export default sessionScreen<Readonly<CommunitiesListScreen.AllProps>>(function CommunitiesListScreen({
  navigation,
  route: {
    params: { filters = emptyData, pending = false },
  },
  session,
}) {
  const allCommunities = useSelector(communitiesSelectors.getAllCommunities);
  const pendingCommunities = useSelector(communitiesSelectors.getPendingCommunities);
  const dispatch =
    useDispatch<
      ThunkDispatch<
        IGlobalState,
        any,
        | CommunitiesAction<typeof communitiesActionTypes.LOAD_ALL_COMMUNITIES_PAGE>
        | CommunitiesAction<typeof communitiesActionTypes.LOAD_PENDING_COMMUNITIES_PAGE>
      >
    >();

  const [totalPendingInvitations, setTotalPendingInvitations] = React.useState<number>(pendingCommunities.length);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const paginatedListRef = React.useRef<FlashListRef<InvitationResponseDtoWithThumbnails | typeof LOADING_ITEM_DATA>>(null);
  const filtersListBottomSheetRef = React.useRef<BottomSheetModalMethods>(null);

  const activeFiltersCount = filters.length;

  const displayedCommunities = pending ? pendingCommunities : allCommunities;

  const applyFilters = React.useCallback(
    (newFilters: typeof filters) => {
      navigation.setParams({ filters: newFilters });
    },
    [navigation],
  );

  const togglePendingList = React.useCallback(
    (index: number | undefined) => {
      navigation.setParams({ pending: index === 0 });
    },
    [navigation],
  );

  const loadData = React.useCallback(
    async (page: number, reloadAll?: boolean) => {
      const baseQueryParams: SearchInvitationDto = {
        fields: INVITATION_FIELDS,
        page: page + 1,
        size: PAGE_SIZE,
      };

      const [allRes, pendingRes, totalPending] = await Promise.all([
        accountApi(session, moduleConfig, InvitationClient).getUserInvitations({
          ...baseQueryParams,
          communityType: filters.length === 1 ? filters[0] : undefined,
        }),
        accountApi(session, moduleConfig, InvitationClient).getUserInvitations({
          ...baseQueryParams,
          communityType: filters.length === 1 ? filters[0] : undefined,
          status: InvitationStatus.PENDING,
        }),
        accountApi(session, moduleConfig, InvitationClient).getUserInvitations({
          size: 1,
          status: InvitationStatus.PENDING,
        }),
      ]);

      dispatch(
        communitiesActions.loadAllCommunitiesPage(
          {
            from: page * PAGE_SIZE,
            items: allRes.items,
            total: allRes.meta.totalItems,
          },
          reloadAll,
        ),
      );

      dispatch(
        communitiesActions.loadPendingCommunitiesPage(
          {
            from: page * PAGE_SIZE,
            items: pendingRes.items,
            total: pendingRes.meta.totalItems,
          },
          reloadAll,
        ),
      );

      setTotalPendingInvitations(totalPending.meta.totalItems);
      setIsLoading(false);
    },
    [dispatch, filters, session],
  );

  const openFiltersBottomSheet = React.useCallback(() => {
    filtersListBottomSheetRef.current?.present();
  }, []);

  const keyExtractor = React.useCallback<NonNullable<PaginatedFlashListProps<InvitationResponseDtoWithThumbnails>['keyExtractor']>>(
    item => item.id.toString(),
    [],
  );

  const renderItem = React.useCallback(
    ({ index, item }: { item: InvitationResponseDtoWithThumbnails; index: number }) => {
      if (!item.community) return null;
      const itemSeparator = getItemSeparatorStyle(index, displayedCommunities.length, styles.itemSeparator);

      const image = item.community.mobileThumbnails?.length ? item.community.mobileThumbnails : toURISource(item.community.image!);

      return (
        <CommunityCardSmall
          key={item.id}
          title={item.community.title}
          image={image}
          invitationStatus={item.status}
          itemSeparatorStyle={itemSeparator}
          membersCount={item.communityStats?.totalMembers}
          onPress={() => {
            if (item.status === InvitationStatus.ACCEPTED || item.status === InvitationStatus.REQUEST_ACCEPTED) {
              navigation.navigate(communitiesRouteNames.home, { communityId: item.communityId, invitationId: item.id });
            } else {
              navigation.navigate(communitiesRouteNames.joinConfirm, { communityId: item.communityId, invitationId: item.id });
            }
          }}
        />
      );
    },
    [displayedCommunities.length, navigation],
  );

  const renderPlaceholderItem = React.useCallback(
    ({ index }: { index: number }) => {
      const itemSeparator = getItemSeparatorStyle(index, displayedCommunities.length, styles.itemSeparator);

      return <CommunityCardSmallLoader itemSeparatorStyle={itemSeparator} />;
    },
    [displayedCommunities.length],
  );

  // Reload data on filters change
  React.useEffect(() => {
    loadData(0, true);
  }, [loadData]);

  React.useEffect(() => {
    if (paginatedListRef.current) {
      paginatedListRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
  }, [loadData]);

  return (
    <>
      {isLoading ? (
        <View style={filtersStyles.filterBar}>
          <SegmentedControlLoader />
          <CommunityListFilterButtonLoader />
        </View>
      ) : (
        <CommunityListFilters
          activeFiltersCount={activeFiltersCount}
          isShowingPending={pending}
          onFiltersButtonPress={openFiltersBottomSheet}
          onPendingPress={togglePendingList}
          pendingInvitationsCount={totalPendingInvitations}
        />
      )}
      <PaginatedFlashList
        ref={paginatedListRef}
        contentContainerStyle={styles.listPadding}
        data={displayedCommunities}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <EmptyScreen
            svgImage="empty-communities-list"
            title={I18n.get(pending ? 'communities-list-empty-title-pending' : 'communities-list-empty-title')}
            text={I18n.get(pending ? 'communities-list-empty-text-pending' : 'communities-list-empty-text')}
            customStyle={styles.emptyScreen}
          />
        }
        onPageReached={loadData}
        pageSize={PAGE_SIZE}
        renderItem={renderItem}
        renderPlaceholderItem={renderPlaceholderItem}
        scrollsToTop
      />
      <ListFiltersBottomSheet onValidate={applyFilters} ref={filtersListBottomSheetRef} selectedFilters={filters} />
    </>
  );
});
