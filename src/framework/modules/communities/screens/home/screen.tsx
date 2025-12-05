import * as React from 'react';
import { View } from 'react-native';

import {
  AnnouncementClient,
  CommunityClient,
  InvitationClient,
  InvitationResponseDto,
  SearchAnnouncementDto,
} from '@edifice.io/community-client-rest-rn';
import { Temporal } from '@js-temporal/polyfill';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';
import type { CommunitiesHomeScreen } from './types';
import { useCommunityBannerHeight } from '../../hooks/use-community-navbar/community-navbar/component';

import { I18n } from '~/app/i18n';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { EmptyContent } from '~/framework/components/empty-screens/base/component';
import { LOADING_ITEM_DATA, PaginatedFlatListProps, staleOrSplice } from '~/framework/components/list/paginated-list';
import { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { HeadingXSText } from '~/framework/components/text';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
import { audienceService } from '~/framework/modules/audience/service';
import { getSession } from '~/framework/modules/auth/reducer';
import { toMedia } from '~/framework/modules/communities/adapter';
import AnnouncementListItem from '~/framework/modules/communities/components/announcements/list/item/';
import PostDetailsLoader from '~/framework/modules/communities/components/announcements/post/details/loader';
import { PostDetailsProps } from '~/framework/modules/communities/components/announcements/post/details/types';
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
import { communitiesActions, communitiesSelectors } from '~/framework/modules/communities/store';
import communitiesStyles from '~/framework/modules/communities/styles';
import { getItemSeparatorStyle } from '~/framework/modules/communities/utils';
import { toURISource } from '~/framework/util/media';
import { accountApi, sessionApi } from '~/framework/util/transport';

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
  image,
  membersId,
  navigation,
  route,
  route: {
    params: { communityId, invitationId, showWelcome = false },
  },
  session,
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
  console.info({ canShowInfoModal, role, senderId, senderName });

  const infoModalRef = React.useRef<BottomSheetModalMethods>(null);

  const openInfoModal = React.useCallback(() => {
    infoModalRef.current?.present();
  }, []);

  React.useEffect(() => {
    navigation.setOptions(communityNavBar({ navigation, route }, openInfoModal));
  }, [navigation, openInfoModal, route]);

  const keyExtractor = React.useCallback<NonNullable<PaginatedFlatListProps<PostDetailsProps<number>>['keyExtractor']>>(
    item => item.resourceId.toString(),
    [],
  );

  const [announcements, setAnnouncements] = React.useState<(PostDetailsProps<number> | typeof LOADING_ITEM_DATA)[]>([]);

  const renderItem = React.useCallback(
    ({ index, item }: { index: number; item: PostDetailsProps<number> }) => {
      const itemSeparator = getItemSeparatorStyle(index, announcements.length, styles.itemSeparator);
      const itemStyle = [styles.itemContainer, itemSeparator];

      return <AnnouncementListItem announcement={item} style={itemStyle} />;
    },
    [announcements.length],
  );

  const [scrollElements, statusBar, scrollViewProps] = useCommunityScrollableThumbnail({
    image,
    title,
  });

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
              <CoursesTile />
              <ConversationTile />
            </View>
          </View>
        </View>
        <HeadingXSText style={styles.announcementTitle}>{I18n.get('communities-announcements-title')}</HeadingXSText>
      </View>,
    ],
    [communityId, membersId, navigation, scrollElements, title, totalMembers],
  );

  const audienceReferer = React.useMemo(
    () => ({
      module: moduleConfig.name,
      resourceType: 'announcement',
    }),
    [],
  );

  const loadData = React.useCallback(
    async (page: number, reloadAll?: boolean) => {
      try {
        const baseQueryParams: SearchAnnouncementDto = {
          page: page + 1,
          size: ANNOUNCEMENTS_PAGE_SIZE,
        };

        const items = await sessionApi(moduleConfig, AnnouncementClient).getAnnouncements(communityId, baseQueryParams);
        const itemsIds = items.items.map(i => i.id.toString());
        const reactions = await audienceService.reaction.getSummary(audienceReferer.module, audienceReferer.resourceType, itemsIds);

        const newAnnouncements: PostDetailsProps<number>[] = items.items.map(e => ({
          audience: {
            infosReactions: {
              total: reactions.reactionsByResource[e.id].totalReactionsCounter,
              types: reactions.reactionsByResource[e.id].reactionTypes,
              userReaction: reactions.reactionsByResource[e.id].userReaction,
            },
            referer: {
              ...audienceReferer,
              resourceId: e.id.toString(),
            },
            session,
          },
          author: {
            userId: e.author.entId,
            username: e.author.displayName,
          },
          content: e.content,
          date: Temporal.Instant.from((e.modificationDate ?? e.publicationDate) as unknown as string),
          media: e.media && e.media.map(toMedia),
          resourceId: e.id,
        }));

        setAnnouncements(prevData => {
          return staleOrSplice({
            newData: newAnnouncements,
            previousData: prevData,
            reloadAll,
            start: page * ANNOUNCEMENTS_PAGE_SIZE,
            total: items.meta.totalItems,
          });
        });
      } catch (e) {
        console.error('Error while loading community members list', e);
      }
    },
    [audienceReferer, communityId, session],
  );

  return (
    <>
      {statusBar}
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
        stickyElements={stickyElements}
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

export default (function CommunitiesHomeScreen({
  navigation,
  route,
  route: {
    params: { communityId },
  },
}: Readonly<CommunitiesHomeScreen.AllProps>) {
  const session = getSession();
  const data = useSelector(communitiesSelectors.getCommunityDetails(communityId));
  const dispatch = useDispatch();
  const setData = React.useCallback(
    (newData: Parameters<typeof communitiesActions.loadCommunityDetails>[1]) =>
      dispatch(communitiesActions.loadCommunityDetails(communityId, newData)),
    [dispatch, communityId],
  );

  const loadContent = React.useCallback(async () => {
    if (!session) return;
    const [community, invitations] = await Promise.all([
      accountApi(session, moduleConfig, CommunityClient).getCommunity(communityId),
      accountApi(session, moduleConfig, InvitationClient).getInvitationsAndMembers(communityId, { page: 1, size: 20 }),
    ]);
    setData({
      ...community,
      membersId: invitations.items.map(item => item.user.entId),
      totalMembers: invitations.meta.totalItems,
    });
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

  const renderContent: NonNullable<ContentLoaderProps['renderContent']> = React.useCallback(
    refreshControl =>
      data && session ? (
        <CommunitiesHomeScreenLoaded
          navigation={navigation}
          route={route}
          refreshControl={refreshControl}
          {...data}
          image={image!}
          session={session}
        />
      ) : (
        <EmptyContentScreen />
      ),
    [data, navigation, route, session, image],
  );

  return (
    <PageView style={communitiesStyles.screen}>
      <ContentLoader loadContent={loadContent} renderLoading={CommunitiesHomeScreenPlaceholder} renderContent={renderContent} />
    </PageView>
  );
});
