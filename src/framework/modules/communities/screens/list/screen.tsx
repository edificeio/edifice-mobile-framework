import * as React from 'react';
import { PixelRatio, View } from 'react-native';

import {
  CommunityType,
  InvitationClient,
  InvitationFields,
  InvitationResponseDto,
  InvitationStatus,
  SearchInvitationDto,
} from '@edifice.io/community-client-rest-rn';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import styles from './styles';
import type { CommunitiesListScreen } from './types';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { LOADING_ITEM_DATA, PaginatedFlashList, PaginatedFlashListProps } from '~/framework/components/list/paginated-list';
import { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import { PageView } from '~/framework/components/page';
import { SegmentedControlLoader } from '~/framework/components/segmented-control';
import { TextSizeStyle } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import CommunityCardSmall, { styles as cardStyle } from '~/framework/modules/communities/components/community-card-small';
import CommunityCardSmallLoader from '~/framework/modules/communities/components/community-card-small/community-card-small-loader';
import CommunityListFilters from '~/framework/modules/communities/components/community-list-filters';
import { styles as filtersStyles } from '~/framework/modules/communities/components/community-list-filters/';
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
import communitiesStyles from '~/framework/modules/communities/styles';
import { ESTIMATED_LIST_SIZE, getItemSeparatorStyle } from '~/framework/modules/communities/utils';
import { navBarOptions } from '~/framework/navigation/navBar';
import { accountApi } from '~/framework/util/transport';

export const AVAILABLE_FILTERS = [CommunityType.CLASS, CommunityType.FREE];
const INVITATION_FIELDS: InvitationFields[] = ['stats', 'community'];
const PAGE_SIZE = 48;

const ESTIMATED_ITEM_SIZE =
  TextSizeStyle.Medium.lineHeight * PixelRatio.getFontScale() +
  cardStyle.imgContainer.height +
  2 * (cardStyle.cardPending.borderWidth + cardStyle.titleContainer.padding);

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

export default (function CommunitiesListScreen({
  navigation,
  route: {
    params: { filters = emptyData, pending = false },
  },
}: Readonly<CommunitiesListScreen.AllProps>) {
  const session = getSession();
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

  const paginatedListRef = React.useRef<FlashList<InvitationResponseDto | typeof LOADING_ITEM_DATA>>(null);
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
      if (!session) return;
      const baseQueryParams: SearchInvitationDto = {
        fields: INVITATION_FIELDS,
        page: page + 1,
        size: PAGE_SIZE,
      };

      const [allRes, pendingRes, totalPending] = await Promise.all([
        accountApi(session, moduleConfig, InvitationClient).getUserInvitations({ ...baseQueryParams, communityType: filters[0] }),
        accountApi(session, moduleConfig, InvitationClient).getUserInvitations({
          ...baseQueryParams,
          communityType: filters[0],
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

  const keyExtractor = React.useCallback<NonNullable<PaginatedFlashListProps<InvitationResponseDto>['keyExtractor']>>(
    item => item.id.toString(),
    [],
  );

  const renderItem = React.useCallback(
    ({ index, item }: { item: InvitationResponseDto; index: number }) => {
      if (!item.community) return null;
      const itemSeparator = getItemSeparatorStyle(index, displayedCommunities.length, styles.itemSeparator);

      return (
        <CommunityCardSmall
          key={item.id}
          title={item.community.title}
          image={item.community.image}
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
    <PageView style={communitiesStyles.screen}>
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
        estimatedItemSize={ESTIMATED_ITEM_SIZE}
        estimatedListSize={ESTIMATED_LIST_SIZE}
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
    </PageView>
  );
});
