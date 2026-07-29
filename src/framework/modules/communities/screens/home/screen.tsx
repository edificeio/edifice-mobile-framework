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
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { EmptyContent } from '~/framework/components/empty-screens/base/component';
import { LOADING_ITEM_DATA, PaginatedFlatListProps, staleOrSplice } from '~/framework/components/list/paginated-list';
import { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { sessionScreen } from '~/framework/components/screen';
import ScrollView from '~/framework/components/scrollView';
import { HeadingXSText } from '~/framework/components/text';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
import { usePrevious } from '~/framework/hooks/previous';
import AnnouncementListItem from '~/framework/modules/communities/components/announcements/list/item/';
import { getCollectionStatus } from '~/framework/modules/communities/components/announcements/list/item/collection';
import PostDetailsLoader from '~/framework/modules/communities/components/announcements/post/details/loader';
import CommunityInfoBottomSheet from '~/framework/modules/communities/components/community-info-bottom-sheet';
import CommunityWelcomeBottomSheetModal from '~/framework/modules/communities/components/community-welcome-bottomsheet';
import ConversationTile, {
  ConversationTileLoader,
} from '~/framework/modules/communities/components/home-screen-tiles/conversation';
import CoursesTile, { CoursesTileLoader } from '~/framework/modules/communities/components/home-screen-tiles/courses';
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
import { hasDiscussions as fetchHasDiscussions } from '~/framework/modules/communities/service/conversations';
import { communitiesActions, communitiesSelectors } from '~/framework/modules/communities/store';
import { getItemSeparatorStyle } from '~/framework/modules/communities/utils';
import { toURISource } from '~/framework/modules/media';
import { accountApi, sessionApi } from '~/framework/util/transport';

import styles from './styles';
import type { CommunitiesHomeScreen } from './types';

const ANNOUNCEMENTS_PAGE_SIZE = 20;

const SCROLL_INDICATOR_INSETS = {
  bottom: 0,
  right: 0.001,
  top: BANNER_BASE_HEIGHT - UI_SIZES.spacing.medium * 2,
};

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
  hasDiscussions,
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

  const [announcements, setAnnouncements] = React.useState<(AnnouncementDetails<number> | typeof LOADING_ITEM_DATA)[]>([]);

  const renderItem = React.useCallback(
    ({ index, item }: { index: number; item: AnnouncementDetails<number> }) => {
      const itemSeparator = getItemSeparatorStyle(index, announcements.length, styles.itemSeparator);
      const separatorColor =
        itemSeparator && item.type === AnnouncementType.COLLECT
          ? { borderBottomColor: getCollectionStatus(item, role).colors.light }
          : undefined;
      const itemStyle = [styles.itemContainer, itemSeparator, separatorColor];

      return <AnnouncementListItem announcement={item} session={session} style={itemStyle} userRole={role} />;
    },
    [announcements.length, role, session],
  );

  const [scrollElements, statusBar, scrollViewProps] = useCommunityScrollableThumbnail({
    image,
    title,
  });

  const previousStatusBar = usePrevious(statusBar);
  if (previousStatusBar !== statusBar) {
    navigation.setOptions({
      statusBarStyle: statusBar,
    });
  }

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
              <ConversationTile communityId={communityId} hasDiscussions={hasDiscussions} platformUrl={platformUrl} />
            </View>
          </View>
        </View>
        <HeadingXSText style={styles.announcementTitle}>{I18n.get('communities-announcements-title')}</HeadingXSText>
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
      hasDiscussions,
    ],
  );

  const loadData = React.useCallback(
    async (page: number, reloadAll?: boolean) => {
      try {
        const { announcements: newAnnouncements, total } = await getAnnouncementsDetails(
          communityId,
          page,
          ANNOUNCEMENTS_PAGE_SIZE,
        );

        setAnnouncements(prevData => {
          return staleOrSplice({
            newData: newAnnouncements,
            previousData: prevData,
            reloadAll,
            start: page * ANNOUNCEMENTS_PAGE_SIZE,
            total,
          });
        });
      } catch (e) {
        console.error('Error while loading community announcements list', e);
      }
    },
    [communityId],
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
        data={announcements}
        onPageReached={loadData}
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
        scrollIndicatorInsets={SCROLL_INDICATOR_INSETS}
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
              <ConversationTileLoader />
            </View>
          </View>
        </View>
        <View style={styles.announcementTitle}>
          <TitleLoader isShort={true} />
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
  const [communityHasDiscussions, setCommunityHasDiscussions] = React.useState(false);

  const loadContent = React.useCallback(async () => {
    const [community, invitations, userInvitation, communityDiscussions] = await Promise.all([
      accountApi(session, moduleConfig, CommunityClient).getCommunity(communityId),
      accountApi(session, moduleConfig, MembershipClient).getMembers(communityId, { includePending: true, page: 1, size: 20 }),
      accountApi(session, moduleConfig, InvitationClient).getUserInvitations({ communityId }),
      // Temporary check to allow web redirection if user has at least one discussion
      fetchHasDiscussions(communityId).catch(e => {
        console.error('Error while checking community discussions', e);
        return false;
      }),
    ]);

    setData({
      ...community,
      membersId: invitations.items.map(item => item.user.entId),
      totalMembers: invitations.meta.totalItems,
    });
    setInvitationId(userInvitation.items.at(0)?.id);
    setCommunityHasDiscussions(communityDiscussions);
  }, [communityId, session, setData]);

  const image = React.useMemo(
    () =>
      data
        ? data.mobileThumbnails?.length
          ? data.mobileThumbnails.map(src => ({ ...src, height: 130, width: 440 }))
          : [toURISource(data.image!)]
        : undefined,
    [data],
  );

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
          hasDiscussions={communityHasDiscussions}
          image={image!}
          session={session}
          spotlightedCourseId={spotlightedCourseId}
        />
      ) : (
        <EmptyContentScreen />
      ),
    [data, navigation, realRoute, communityHasDiscussions, image, session, spotlightedCourseId],
  );

  return <ContentLoader loadContent={loadContent} renderLoading={CommunitiesHomeScreenPlaceholder} renderContent={renderContent} />;
});
