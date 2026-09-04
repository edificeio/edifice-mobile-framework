import * as React from 'react';
import { View } from 'react-native';

import {
  AnnouncementType,
  CommunityClient,
  CommunitySection,
  InvitationClient,
  InvitationResponseDto,
  MembershipClient,
} from '@edifice.io/community-client-rest-rn';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { EmptyContent } from '~/framework/components/empty-screens/base/component';
import { LOADING_ITEM_DATA, PaginatedFlatListProps, staleOrSplice } from '~/framework/components/list/paginated-list';
import { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { sessionScreen } from '~/framework/components/screen';
import ScrollView from '~/framework/components/scrollView';
import SegmentedControl, { SegmentedControlLoader } from '~/framework/components/segmented-control';
import { HeadingXSText } from '~/framework/components/text';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
import AnnouncementListItem from '~/framework/modules/communities/components/announcements/list/item/';
import { getCollectionStatus } from '~/framework/modules/communities/components/announcements/list/item/collection';
import PostDetailsLoader from '~/framework/modules/communities/components/announcements/post/details/loader';
import CommunityInfoBottomSheet from '~/framework/modules/communities/components/community-info-bottom-sheet';
import CommunityWelcomeBottomSheetModal from '~/framework/modules/communities/components/community-welcome-bottomsheet';
import CoursesTile, { CoursesTileLoader } from '~/framework/modules/communities/components/home-screen-tiles/courses';
import DiscussionsTile, { DiscussionsTileLoader } from '~/framework/modules/communities/components/home-screen-tiles/discussions';
import DocumentsTile, { DocumentsTileLoader } from '~/framework/modules/communities/components/home-screen-tiles/documents';
import MembersTile, { MembersTileLoader } from '~/framework/modules/communities/components/home-screen-tiles/members';
import DecoratedPaginatedFlatList from '~/framework/modules/communities/components/list/decorated-paginated-list';
import {
  communityNavBar,
  default as useCommunityScrollableThumbnail,
} from '~/framework/modules/communities/hooks/use-community-navbar';
import { BANNER_BASE_HEIGHT } from '~/framework/modules/communities/hooks/use-community-navbar/community-navbar/styles';
import moduleConfig from '~/framework/modules/communities/module-config';
import { CommunitiesNavigationParams, communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { AnnouncementDetails, getAnnouncementsDetails } from '~/framework/modules/communities/service/announcements';
import { DiscussionsSummary, getDiscussionsSummary } from '~/framework/modules/communities/service/discussions';
import { communitiesActions, communitiesSelectors } from '~/framework/modules/communities/store';
import { getCommunityBannerImage, getItemSeparatorStyle } from '~/framework/modules/communities/utils';
import { accountApi, sessionApi } from '~/framework/util/transport';

import styles from './styles';
import type { CommunitiesHomeScreen } from './types';

const ANNOUNCEMENTS_PAGE_SIZE = 20;
const EMPTY_DISCUSSIONS_SUMMARY: DiscussionsSummary = { hasUnreadMessages: false, totalDiscussions: 0 };

const ANNOUNCEMENT_FILTERS = [
  { i18n: 'communities-announcements-filter-all', id: 'all', type: undefined },
  { i18n: 'communities-announcements-filter-information', id: 'information', type: AnnouncementType.INFORMATION },
  { i18n: 'communities-announcements-filter-collect', id: 'collect', type: AnnouncementType.COLLECT },
] as const;

const ALL_FILTER_INDEX = ANNOUNCEMENT_FILTERS.findIndex(filter => filter.type === undefined);
const COLLECT_FILTER_INDEX = ANNOUNCEMENT_FILTERS.findIndex(filter => filter.type === AnnouncementType.COLLECT);

type AnnouncementsPage = (AnnouncementDetails<number> | typeof LOADING_ITEM_DATA)[];

// Stable identity, so a filter without a list of its own doesn't hand a brand new array to the list on every render.
const NO_ANNOUNCEMENTS: AnnouncementsPage = [];

const BannerLoader = () => {
  const { top: statusBarHeight } = useSafeAreaInsets();
  const bannerStyle = React.useMemo(
    () => [styles.loaderBanner, { height: BANNER_BASE_HEIGHT + statusBarHeight }],
    [statusBarHeight],
  );

  return <PlaceholderMedia style={bannerStyle} />;
};

const TitleLoader = ({ isShort }: { isShort?: boolean }) => {
  return <PlaceholderLine noMargin style={[styles.loaderSectionTitle, isShort && styles.loaderSectionTitleShort]} />;
};

export const computeNavBar = (
  props: NativeStackScreenProps<CommunitiesNavigationParams, typeof communitiesRouteNames.home>,
): NativeStackNavigationOptions => communityNavBar(props, () => {});

export const CommunitiesHomeScreenLoaded = function ({
  discussionsSummary,
  image,
  membersId,
  navigation,
  route,
  route: {
    params: { communityId, invitationId, showWelcome = false },
  },
  session,
  spotlightedCourseId,
  title,
  totalMembers,
  welcomeNote,
}: Readonly<CommunitiesHomeScreen.AllPropsLoaded>) {
  const welcomeModalRef = React.useRef<BottomSheetModalMethods>(null);
  React.useEffect(() => {
    (showWelcome && invitationId !== undefined ? welcomeModalRef.current?.present : welcomeModalRef.current?.dismiss)?.();
  }, [showWelcome, invitationId]);

  const invitation = useSelector(communitiesSelectors.getAllCommunities).find(
    item => item !== LOADING_ITEM_DATA && item.id === invitationId,
  ) as InvitationResponseDto | undefined;

  const { role, sentBy } = invitation || {};
  const { displayName: senderName, entId: senderId } = sentBy || {};
  const canShowInfoModal = role && senderId && senderName;
  const platformUrl = session.platform.url;

  const infoModalRef = React.useRef<BottomSheetModalMethods>(null);

  const openInfoModal = React.useCallback(() => {
    infoModalRef.current?.present();
  }, []);

  React.useEffect(() => {
    navigation.setOptions(communityNavBar({ navigation, route }, openInfoModal));
  }, [navigation, openInfoModal, route]);

  const keyExtractor = React.useCallback<NonNullable<PaginatedFlatListProps<AnnouncementDetails<number>>['keyExtractor']>>(
    item => item.resourceId.toString(),
    [],
  );

  const [announcements, setAnnouncements] = React.useState<AnnouncementsPage>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = React.useState(true);
  const [filterIndex, setFilterIndex] = React.useState(ALL_FILTER_INDEX);
  const data = filterIndex === ALL_FILTER_INDEX ? announcements : NO_ANNOUNCEMENTS;

  const renderItem = React.useCallback(
    ({ index, item }: { index: number; item: AnnouncementDetails<number> }) => {
      const itemSeparator = getItemSeparatorStyle(index, data.length, styles.itemSeparator);
      const separatorColor =
        itemSeparator && item.type === AnnouncementType.COLLECT
          ? { borderBottomColor: getCollectionStatus(item, role).colors.light }
          : undefined;
      const itemStyle = [styles.itemContainer, itemSeparator, separatorColor];

      return <AnnouncementListItem announcement={item} session={session} style={itemStyle} userRole={role} />;
    },
    [data.length, role, session],
  );

  const [scrollElements, scrollViewProps] = useCommunityScrollableThumbnail({
    image,
    navigation,
    title,
  });

  const segments = React.useMemo(
    () =>
      ANNOUNCEMENT_FILTERS.map((filter, index) => ({
        badgeColor: theme.palette.status.failure.regular,
        count: index === COLLECT_FILTER_INDEX ? 0 : undefined,
        id: filter.id,
        text: I18n.get(filter.i18n),
      })),
    [],
  );

  const onFilterChange = React.useCallback((index?: number) => setFilterIndex(index ?? 0), []);

  // Sync the SegmentedControl + loader with the announcements list + loader
  const filters = React.useMemo(() => {
    if (isLoadingAnnouncements) return <SegmentedControlLoader isFullWidth />;

    return announcements.length ? (
      <SegmentedControl initialSelectedIndex={filterIndex} segments={segments} onChange={onFilterChange} />
    ) : null;
  }, [isLoadingAnnouncements, announcements.length, filterIndex, segments, onFilterChange]);

  const stickyElements = React.useMemo(
    () => [
      ...scrollElements,
      <View style={styles.tiles}>
        <HeadingXSText>{title}</HeadingXSText>
        <View style={styles.tilesCol}>
          <MembersTile communityId={communityId} navigation={navigation} membersId={membersId} totalMembers={totalMembers} />
          <View style={styles.tilesRow}>
            <View style={styles.tilesCol}>
              <DocumentsTile communityId={communityId} navigation={navigation} />
            </View>
            <View style={styles.tilesCol}>
              <CoursesTile
                communityId={communityId}
                navigation={navigation}
                platformUrl={platformUrl}
                spotlightedCourseId={spotlightedCourseId}
                userRole={role}
              />
              <DiscussionsTile
                communityId={communityId}
                navigation={navigation}
                hasUnreadMessages={discussionsSummary.hasUnreadMessages}
                totalDiscussions={discussionsSummary.totalDiscussions}
                userRole={role}
              />
            </View>
          </View>
        </View>
        <View style={styles.announcementHeader}>
          <HeadingXSText>{I18n.get('communities-announcements-title')}</HeadingXSText>
          {filters}
        </View>
      </View>,
    ],
    [
      scrollElements,
      title,
      communityId,
      navigation,
      membersId,
      totalMembers,
      platformUrl,
      spotlightedCourseId,
      role,
      discussionsSummary.hasUnreadMessages,
      discussionsSummary.totalDiscussions,
      filters,
    ],
  );

  // Note: `onViewableItemsChanged` can ask twice for the same page while it is still in flight.
  const loadingPagesRef = React.useRef<Set<number>>(new Set());

  const loadPage = React.useCallback(
    async (page: number, reloadAll?: boolean) => {
      if (loadingPagesRef.current.has(page)) return;
      loadingPagesRef.current.add(page);

      try {
        const { announcements: newAnnouncements, total } = await getAnnouncementsDetails(
          communityId,
          page,
          ANNOUNCEMENTS_PAGE_SIZE,
          role,
        );

        setAnnouncements(prevData =>
          staleOrSplice({
            newData: newAnnouncements,
            previousData: prevData,
            reloadAll,
            start: page * ANNOUNCEMENTS_PAGE_SIZE,
            total,
          }),
        );
      } catch (e) {
        console.error('Error while loading community announcements list', e);
      } finally {
        setIsLoadingAnnouncements(false);
        loadingPagesRef.current.delete(page);
      }
    },
    [communityId, role],
  );

  useFocusEffect(
    React.useCallback(() => {
      sessionApi(moduleConfig, MembershipClient).updateLastVisit(communityId, { section: CommunitySection.ANNOUNCEMENTS });
    }, [communityId]),
  );

  return (
    <>
      <DecoratedPaginatedFlatList
        alwaysBounceVertical={false}
        data={data}
        onPageReached={loadPage}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <EmptyContent
            extraStyle={styles.emptyContent}
            svg="empty-communities-announcements"
            text={I18n.get('communities-announcements-empty-text')}
            title={I18n.get('communities-announcements-empty-title')}
          />
        }
        pageSize={ANNOUNCEMENTS_PAGE_SIZE}
        renderItem={renderItem}
        renderPlaceholderItem={PostDetailsLoader}
        decorations={stickyElements}
        {...scrollViewProps}
      />
      {invitation?.role && <CommunityWelcomeBottomSheetModal role={invitation?.role} title={title} ref={welcomeModalRef} />}
      {canShowInfoModal ? (
        <CommunityInfoBottomSheet
          ref={infoModalRef}
          data={{ image, role, senderId, senderName, title, totalMembers, welcomeNote }}
        />
      ) : (
        <EmptyContentScreen />
      )}
    </>
  );
};

export const CommunitiesHomeScreenPlaceholder = () => (
  <ScrollView scrollEnabled={false}>
    <Placeholder Animation={Fade}>
      <BannerLoader />
      <View style={styles.loaderPage}>
        <TitleLoader />
        <View style={styles.tilesCol}>
          <MembersTileLoader />
          <View style={styles.tilesRow}>
            <View style={styles.tilesCol}>
              <DocumentsTileLoader />
            </View>
            <View style={styles.tilesCol}>
              <CoursesTileLoader />
              <DiscussionsTileLoader />
            </View>
          </View>
        </View>
        <View style={styles.announcementHeader}>
          <TitleLoader isShort={true} />
          <SegmentedControlLoader isFullWidth />
        </View>
      </View>
      <PostDetailsLoader />
    </Placeholder>
  </ScrollView>
);

export default sessionScreen<CommunitiesHomeScreen.AllProps>(function CommunitiesHomeScreen({
  navigation,
  route,
  route: {
    params: { communityId },
  },
  session,
}) {
  const data = useSelector(communitiesSelectors.getCommunityDetails(communityId));
  const dispatch = useDispatch();
  const setData = React.useCallback(
    (newData: Parameters<typeof communitiesActions.loadCommunityDetails>[1]) =>
      dispatch(communitiesActions.loadCommunityDetails(communityId, newData)),
    [dispatch, communityId],
  );
  const [invitationId, setInvitationId] = React.useState<number | undefined>(undefined);
  const [discussionsSummary, setDiscussionsSummary] = React.useState<DiscussionsSummary>(EMPTY_DISCUSSIONS_SUMMARY);

  const loadContent = React.useCallback(async () => {
    const [community, invitations, userInvitation, fetchedDiscussionsSummary] = await Promise.all([
      accountApi(session, moduleConfig, CommunityClient).getCommunity(communityId),
      accountApi(session, moduleConfig, MembershipClient).getMembers(communityId, { includePending: true, page: 1, size: 20 }),
      accountApi(session, moduleConfig, InvitationClient).getUserInvitations({ communityId }),
      getDiscussionsSummary(session, communityId).catch(e => {
        console.error('Error while loading community discussions summary', e);
        return EMPTY_DISCUSSIONS_SUMMARY;
      }),
    ]);

    setData({
      ...community,
      membersId: invitations.items.map(item => item.user.entId),
      totalMembers: invitations.meta.totalItems,
    });
    setInvitationId(userInvitation.items.at(0)?.id);
    setDiscussionsSummary(fetchedDiscussionsSummary);
  }, [communityId, session, setData]);

  const image = React.useMemo(() => (data ? getCommunityBannerImage(data) : undefined), [data]);

  const spotlightedCourseId = React.useMemo(() => (data ? data.courseEntId : undefined), [data]);

  const realRoute = React.useMemo(() => ({ ...route, params: { ...route.params, invitationId } }), [invitationId, route]);

  const renderContent: NonNullable<ContentLoaderProps['renderContent']> = React.useCallback(
    refreshControl =>
      data ? (
        <CommunitiesHomeScreenLoaded
          navigation={navigation}
          route={realRoute}
          refreshControl={refreshControl}
          {...data}
          discussionsSummary={discussionsSummary}
          image={image!}
          membersId={data.membersId ?? []}
          session={session}
          spotlightedCourseId={spotlightedCourseId}
          totalMembers={data.totalMembers ?? 0}
        />
      ) : (
        <EmptyContentScreen />
      ),
    [data, navigation, realRoute, discussionsSummary, image, session, spotlightedCourseId],
  );

  return <ContentLoader loadContent={loadContent} renderLoading={CommunitiesHomeScreenPlaceholder} renderContent={renderContent} />;
});
