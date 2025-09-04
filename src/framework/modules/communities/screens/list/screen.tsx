import * as React from 'react';
import { PixelRatio, View, ViewStyle } from 'react-native';

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
import { SegmentedControlLoader } from '~/framework/components/buttons/segmented-control';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/empty-screens';
import PaginatedList, { LOADING_ITEM_DATA, PaginatedListProps } from '~/framework/components/list/paginated-list';
import { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import { sessionScreen } from '~/framework/components/screen';
import { TextSizeStyle } from '~/framework/components/text';
import CommunityCardSmall, { styles as cardStyle } from '~/framework/modules/communities/components/community-card-small';
import CommunityCardSmallLoader from '~/framework/modules/communities/components/community-card-small/community-card-small-loader';
import CommunityListFilters from '~/framework/modules/communities/components/community-list-filters';
import { styles as filtersStyles } from '~/framework/modules/communities/components/community-list-filters/';
import { CommunityListFilterButtonLoader } from '~/framework/modules/communities/components/community-list-filters/community-list-filter-button';
import ListFiltersBottomSheet from '~/framework/modules/communities/components/community-list-filters/list-filters-bottom-sheet';
import moduleConfig from '~/framework/modules/communities/module-config';
import { CommunitiesNavigationParams, communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { CommunitiesAction, communitiesActions, communitiesSelectors } from '~/framework/modules/communities/store';
import { navBarOptions } from '~/framework/navigation/navBar';
import http from '~/framework/util/http';

export const AVAILABLE_FILTERS = [CommunityType.CLASS, CommunityType.FREE];
const INVITATION_FIELDS: InvitationFields[] = ['stats', 'community'];
const PAGE_SIZE = 48;

const ESTIMATED_ITEM_SIZE =
  TextSizeStyle.Medium.lineHeight * PixelRatio.getFontScale() +
  cardStyle.imgContainer.height +
  2 * (cardStyle.cardPending.borderWidth + cardStyle.titleContainer.padding);

const ESTIMATED_LIST_SIZE = {
  height: UI_SIZES.getViewHeight(),
  width: UI_SIZES.screen.width,
};

const getItemSeparatorStyle = (index: number, totalLength: number, separatorStyle: ViewStyle) => {
  const isLastItem = index === totalLength - 1;
  return isLastItem ? undefined : separatorStyle;
};

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

const emptyData = [];

export default sessionScreen<Readonly<CommunitiesListScreen.AllProps>>(function CommunitiesListScreen({
  navigation,
  route: {
    params: { filters = emptyData, pending = false },
  },
}) {
  const allCommunities = useSelector(communitiesSelectors.getAllCommunities);
  const pendingCommunities = useSelector(communitiesSelectors.getPendingCommunities);
  const dispatch = useDispatch<ThunkDispatch<IGlobalState, any, CommunitiesAction>>();

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
      const baseQueryParams: SearchInvitationDto = {
        fields: INVITATION_FIELDS,
        page: page + 1,
        size: PAGE_SIZE,
      };

      const [allRes, pendingRes, totalPending] = await Promise.all([
        http.sessionApi(moduleConfig, InvitationClient).getUserInvitations({ ...baseQueryParams, communityType: filters[0] }),
        http.sessionApi(moduleConfig, InvitationClient).getUserInvitations({
          ...baseQueryParams,
          communityType: filters[0],
          status: InvitationStatus.PENDING,
        }),
        http.sessionApi(moduleConfig, InvitationClient).getUserInvitations({
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
    [dispatch, filters],
  );

  const navigateToCommunityHomePage = React.useCallback(
    (communityId: number) => {
      navigation.navigate(communitiesRouteNames.home, { communityId });
    },
    [navigation],
  );

  const openFiltersBottomSheet = React.useCallback(() => {
    filtersListBottomSheetRef.current?.present();
  }, []);

  const keyExtractor = React.useCallback<NonNullable<PaginatedListProps<InvitationResponseDto>['keyExtractor']>>(
    (item, index) => (item === LOADING_ITEM_DATA ? 'loading' + index.toString() : item.id.toString()),
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
          onPress={() => navigateToCommunityHomePage(item.communityId)}
        />
      );
    },
    [displayedCommunities.length, navigateToCommunityHomePage],
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
      <PaginatedList
        ref={paginatedListRef}
        contentContainerStyle={styles.listPadding}
        data={displayedCommunities}
        estimatedItemSize={ESTIMATED_ITEM_SIZE}
        estimatedListSize={ESTIMATED_LIST_SIZE}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <EmptyScreen
            svgImage="empty-communities-list"
            title={I18n.get('communities-list-empty-title')}
            text={I18n.get('communities-list-empty-text')}
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
