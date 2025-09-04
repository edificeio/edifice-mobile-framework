import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { CommunityClient, InvitationResponseDto, MembershipClient } from '@edifice.io/community-client-rest-rn';
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
import { EmptyContent } from '~/framework/components/empty-screens/base/component';
import { LOADING_ITEM_DATA } from '~/framework/components/list/paginated-list';
import { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { Svg } from '~/framework/components/picture';
import { sessionScreen } from '~/framework/components/screen';
import ScrollView from '~/framework/components/scrollView';
import { HeadingXSText } from '~/framework/components/text';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
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
): NativeStackNavigationOptions => communityNavBar(props);

export const CommunitiesHomeScreenLoaded = function ({
  image,
  membersId,
  navigation,
  refreshControl,
  route: {
    params: { communityId, invitationId, showWelcome = false },
  },
  title,
  totalMembers,
  welcomeNote,
}: Readonly<CommunitiesHomeScreen.AllPropsLoaded>) {
  const pageContent = (
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

      <EmptyContent
        title={I18n.get('communities-announcements-soon-title')}
        text={I18n.get('communities-announcements-soon-text')}
        svg="empty-communities-announcements-soon"
      />
    </View>
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
        <CommunitiesHomeScreenLoaded navigation={navigation} route={route} refreshControl={refreshControl} {...data} />
      ) : (
        <EmptyContentScreen />
      ),
    [navigation, route, data],
  );

  return <ContentLoader loadContent={loadContent} renderLoading={CommunitiesHomeScreenPlaceholder} renderContent={renderContent} />;
});
