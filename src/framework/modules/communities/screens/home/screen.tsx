import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { CommunityClient, InvitationResponseDto, MembershipClient } from '@edifice.io/community-client-rest-rn';
import { Temporal } from '@js-temporal/polyfill';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import styles from './styles';
import type { CommunitiesHomeScreen } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
// import { EmptyContent } from '~/framework/components/empty-screens/base/component';
import { LOADING_ITEM_DATA } from '~/framework/components/list/paginated-list';
import { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { Svg } from '~/framework/components/picture';
import { sessionScreen } from '~/framework/components/screen';
import ScrollView from '~/framework/components/scrollView';
import { HeadingXSText } from '~/framework/components/text';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
import AnnouncementsList from '~/framework/modules/communities/components/announcements/list';
import CommunityInfoBottomSheet from '~/framework/modules/communities/components/community-info-bottom-sheet';
import CommunityWelcomeBottomSheetModal from '~/framework/modules/communities/components/community-welcome-bottomsheet';
import ConversationTile, {
  ConversationTileLoader,
} from '~/framework/modules/communities/components/home-screen-tiles/conversation';
import CoursesTile, { CoursesTileLoader } from '~/framework/modules/communities/components/home-screen-tiles/courses';
import DocumentsTile, { DocumentsTileLoader } from '~/framework/modules/communities/components/home-screen-tiles/documents';
import MembersTile, { MembersTileLoader } from '~/framework/modules/communities/components/home-screen-tiles/members';
import {
  communityNavBar,
  NAVBAR_RIGHT_BUTTON_STYLE,
  default as useCommunityScrollableThumbnail,
} from '~/framework/modules/communities/hooks/use-community-navbar';
import { BANNER_BASE_HEIGHT } from '~/framework/modules/communities/hooks/use-community-navbar/community-navbar/styles';
import moduleConfig from '~/framework/modules/communities/module-config';
import { CommunitiesNavigationParams, communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { communitiesActions, communitiesSelectors } from '~/framework/modules/communities/store';
import { INotificationMedia } from '~/framework/util/notifications';
import { accountApi } from '~/framework/util/transport';

const NavbarRightButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity style={NAVBAR_RIGHT_BUTTON_STYLE} onPress={onPress}>
      <Svg
        name="ui-infoCircle"
        width={UI_SIZES.elements.icon.small}
        height={UI_SIZES.elements.icon.small}
        fill={theme.palette.grey.black}
      />
    </TouchableOpacity>
  );
};

const BannerLoader = () => {
  const { top: statusBarHeight } = useSafeAreaInsets();
  const bannerStyle = React.useMemo(
    () => [styles.loaderBanner, { height: BANNER_BASE_HEIGHT + statusBarHeight }],
    [statusBarHeight],
  );

  return <PlaceholderMedia style={bannerStyle} />;
};

const EmptyScreenLoader = () => {
  return (
    <View style={styles.loaderEmptyScreen}>
      <PlaceholderMedia style={styles.loaderEmptyImage} />
      <View style={styles.loaderEmptyScreenLines}>
        <PlaceholderLine noMargin style={styles.loaderEmptyBigLine} />
        <PlaceholderLine noMargin style={styles.loaderEmptySmallLine} />
        <PlaceholderLine noMargin style={styles.loaderEmptySmallLine} />
      </View>
    </View>
  );
};

const TitleLoader = ({ isShort }: { isShort?: boolean }) => {
  return <PlaceholderLine noMargin style={[styles.loaderSectionTitle, isShort && styles.loaderSectionTitleShort]} />;
};

export const computeNavBar = (
  props: NativeStackScreenProps<CommunitiesNavigationParams, typeof communitiesRouteNames.home>,
): NativeStackNavigationOptions => communityNavBar(props, true);

export const CommunitiesHomeScreenLoaded = function ({
  image,
  membersId,
  navigation,
  refreshControl,
  route: {
    params: { communityId, invitationId, showWelcome = false },
  },
  session,
  title,
  totalMembers,
  welcomeNote,
}: Readonly<CommunitiesHomeScreen.AllPropsLoaded>) {
  const mockImages: INotificationMedia[] = [
    {
      src: '/workspace/document/58f637a3-ff3d-454b-8f38-76dcd2e7c83b',
      type: 'image',
    },
    {
      src: '/workspace/document/720ae42a-e07e-4d2a-9f53-8d18053299cb?timestamp=1758790192403',
      type: 'image',
    },
  ];

  const mockVideos: INotificationMedia[] = [
    {
      src: '/workspace/document/5daf2aa5-77cf-43c4-a574-a5bb605e98bc',
      type: 'video',
    },
    // {
    //   src: '/workspace/document/720ae42a-e07e-4d2a-9f53-8d18053299cb?timestamp=1758790192403',
    //   type: 'image',
    // },
  ];

  const mockAnnouncements = [
    {
      audience: {
        infosReactions: {
          total: 5,
          types: [] as string[],
          userReaction: '',
        },
        referer: {
          module: 'communities',
          resourceId: 'announcement-1',
          resourceType: 'announcement',
        },
        session: session,
      },
      author: {
        userId: '0738b742-8e00-481e-bdcc-8e0f18bf0d79',
        username: 'Auteur Test',
      },
      content:
        "<p>Ceci est le contenu de l'annonce de test avec du <strong>texte en gras</strong> et des <em>italiques</em>.</p><p>Voici un second paragraphe pour tester l'affichage du contenu riche.</p>",
      date: Temporal.Instant.from('2025-10-01T14:30:00Z'),
      media: mockImages,
      resourceId: 'announcement-1',
      title: "Titre de l'annonce test",
    },
    {
      audience: {
        infosReactions: {
          total: 12,
          types: [] as string[],
          userReaction: '',
        },
        referer: {
          module: 'communities',
          resourceId: 'announcement-2',
          resourceType: 'announcement',
        },
        session: session,
      },
      author: {
        userId: '0738b742-8e00-481e-bdcc-8e0f18bf0d79',
        username: 'Auteur Test2',
      },
      content:
        "<p>Ceci est le contenu de l'annonce de test avec du <strong>texte en gras</strong> et des <em>italiques</em>.</p><p>Voici un second paragraphe pour tester l'affichage du contenu riche.</p>",
      date: Temporal.Instant.from('2025-03-01T14:30:00Z'),
      media: mockVideos,
      resourceId: 'announcement-2',
      title: "Titre de l'annonce test2",
    },
  ];

  const pageContent = (
    <>
      <View style={styles.page}>
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
        <HeadingXSText>{I18n.get('communities-announcements-title')}</HeadingXSText>
        {/* <EmptyContent
        title={I18n.get('communities-announcements-soon-title')}
        text={I18n.get('communities-announcements-soon-text')}
        svg="empty-communities-announcements-soon"
      /> */}
      </View>
      <AnnouncementsList announcements={mockAnnouncements} />
    </>
  );

  const [scrollElements, statusBar, scrollViewProps] = useCommunityScrollableThumbnail({
    image,
    title,
  });

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

  const infoModalRef = React.useRef<BottomSheetModalMethods>(null);

  const openInfoModal = React.useCallback(() => {
    infoModalRef.current?.present();
  }, []);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => <NavbarRightButton onPress={openInfoModal} />,
    });
  }, [navigation, openInfoModal]);

  return (
    <>
      {statusBar}
      <ScrollView alwaysBounceVertical={false} refreshControl={refreshControl} {...scrollViewProps}>
        {scrollElements}
        {pageContent}
      </ScrollView>
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
        <TitleLoader isShort={true} />
        <EmptyScreenLoader />
      </View>
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

  const loadContent = React.useCallback(async () => {
    const [community, members] = await Promise.all([
      accountApi(session, moduleConfig, CommunityClient).getCommunity(communityId),
      accountApi(session, moduleConfig, MembershipClient).getMembers(communityId, { page: 1, size: 16 }),
    ]);
    setData({
      ...community,
      membersId: members.items.map(item => item.user.entId),
      totalMembers: members.meta.totalItems,
    });
  }, [communityId, session, setData]);

  const renderContent: NonNullable<ContentLoaderProps['renderContent']> = React.useCallback(
    refreshControl =>
      data ? (
        <CommunitiesHomeScreenLoaded
          navigation={navigation}
          route={route}
          refreshControl={refreshControl}
          {...data}
          session={session}
        />
      ) : (
        <EmptyContentScreen />
      ),
    [data, navigation, route, session],
  );

  return <ContentLoader loadContent={loadContent} renderLoading={CommunitiesHomeScreenPlaceholder} renderContent={renderContent} />;
});
