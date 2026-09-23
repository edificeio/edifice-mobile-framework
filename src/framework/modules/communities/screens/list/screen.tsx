import * as React from 'react';
import { View } from 'react-native';

import { CommunityType, InvitationStatus } from '@edifice.io/community-client-rest-rn';
import { InvitationResponseDtoWithThumbnails } from '@edifice.io/community-client-rest-rn/utils';
import type { FlashListRef } from '@shopify/flash-list';
import { useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
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
import useCommunitiesList from '~/framework/modules/communities/hooks/use-communities-list';
import { communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { communitiesSelectors } from '~/framework/modules/communities/store';
import { getItemSeparatorStyle } from '~/framework/modules/communities/utils';
import { toURISource } from '~/framework/modules/media';

import styles from './styles';
import type { CommunitiesListScreen } from './types';

export const AVAILABLE_FILTERS = [CommunityType.CLASS, CommunityType.FREE];
const PAGE_SIZE = 48;
const DISPLAYED_STATUSES = new Set<InvitationStatus>([
  InvitationStatus.PENDING,
  InvitationStatus.ACCEPTED,
  InvitationStatus.REQUEST_ACCEPTED,
]);

export const CommunitiesListScreenOptions = screenOptions(() => ({
  title: I18n.get('communities-list-title'),
}));

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
  const { isLoading, loadData, totalPendingInvitations } = useCommunitiesList({ filters, pageSize: PAGE_SIZE, session });

  const paginatedListRef = React.useRef<FlashListRef<InvitationResponseDtoWithThumbnails | typeof LOADING_ITEM_DATA>>(null);
  const filtersListBottomSheetRef = React.useRef<BottomSheetModalMethods>(null);

  const activeFiltersCount = filters.length;

  // Undesired statuses (REQUEST, REJECTED…) are filtered at display time only.
  // Loading placeholders (unloaded pages) must be kept: the list relies on them to fetch the next pages.
  const displayedCommunities = React.useMemo(
    () =>
      pending
        ? pendingCommunities
        : allCommunities.filter(item => item === LOADING_ITEM_DATA || DISPLAYED_STATUSES.has(item.status)),
    [allCommunities, pending, pendingCommunities],
  );

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
      const hasJoinedWithCode = item.status === InvitationStatus.REQUEST_ACCEPTED;

      return (
        <CommunityCardSmall
          key={item.id}
          title={item.community.title}
          image={image}
          invitationStatus={item.status}
          itemSeparatorStyle={itemSeparator}
          membersCount={item.communityStats?.totalMembers}
          onPress={() => {
            if (item.status === InvitationStatus.ACCEPTED || hasJoinedWithCode) {
              navigation.navigate(communitiesRouteNames.home, {
                communityId: item.communityId,
                hasJoinedWithCode: hasJoinedWithCode,
                invitationId: item.id,
              });
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

  // Scroll back to top on filters change (loadData changes with filters)
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
