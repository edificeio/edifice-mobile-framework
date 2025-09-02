import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { CommunityClient, InvitationResponseDto, MembershipClient } from '@edifice.io/community-client-rest-rn';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';

import styles from './styles';
import type { CommunitiesHomeScreen } from './types';
import { communitiesActions, communitiesSelectors } from '../../store';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { AvatarStack } from '~/framework/components/avatar/stack';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { EmptyContent } from '~/framework/components/empty-screens/base/component';
import { LOADING_ITEM_DATA } from '~/framework/components/list/paginated-list';
import { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { Svg } from '~/framework/components/picture';
import Pill from '~/framework/components/pill';
import { sessionScreen } from '~/framework/components/screen';
import ScrollView from '~/framework/components/scrollView';
import { HeadingXSText, SmallBoldText, SmallText } from '~/framework/components/text';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
import CommunityWelcomeBottomSheetModal from '~/framework/modules/communities/components/community-welcome-bottomsheet';
import {
  communityNavBar,
  default as useCommunityScrollableThumbnail,
} from '~/framework/modules/communities/hooks/use-community-navbar';
import moduleConfig from '~/framework/modules/communities/module-config';
import { CommunitiesNavigationParams, communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { accountApi } from '~/framework/util/http';

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
}: Readonly<CommunitiesHomeScreen.AllPropsLoaded>) {
  const membersTile = (
    <TouchableOpacity
      style={styles.tileMembers}
      onPress={React.useCallback(
        () => navigation.navigate(communitiesRouteNames.members, { communityId }),
        [communityId, navigation],
      )}>
      <AvatarStack style={UI_STYLES.flex1} size="md" items={membersId} total={totalMembers} />
      <SmallBoldText style={styles.tileCaptionTextAvailable}>{I18n.get('communities-tile-members-title')}</SmallBoldText>
    </TouchableOpacity>
  );

  const documentsTile = (
    <TouchableOpacity
      style={styles.tileDocuments}
      onPress={React.useCallback(
        () => navigation.navigate(communitiesRouteNames.documents, { communityId }),
        [communityId, navigation],
      )}>
      <View style={styles.largeTileIcon}>
        <Svg
          name="ui-folder"
          width={UI_SIZES.elements.icon.default}
          height={UI_SIZES.elements.icon.default}
          fill={theme.ui.text.inverse}
        />
      </View>
      <SmallBoldText style={styles.tileCaptionTextAvailable}>{I18n.get('communities-tile-documents-title')}</SmallBoldText>
      <SmallText style={styles.tileCaptionDescriptionAvailable} />
    </TouchableOpacity>
  );

  const coursesTile = (
    <View style={styles.tileCourses}>
      <View style={styles.tileCaption}>
        <Svg
          name="ui-textPage"
          width={UI_SIZES.elements.icon.small}
          height={UI_SIZES.elements.icon.small}
          fill={styles.tileCaptionTextUnavailable.color}
        />
        <SmallBoldText style={styles.tileCaptionTextUnavailable}>{I18n.get('communities-tile-courses-title')}</SmallBoldText>
      </View>
      <Pill text={I18n.get('communities-tile-soon')} color={theme.palette.grey.stone} />
    </View>
  );

  const conversationTile = (
    <View style={styles.tileConversation}>
      <View style={styles.tileCaption}>
        <Svg
          name="ui-messageInfo"
          width={UI_SIZES.elements.icon.small}
          height={UI_SIZES.elements.icon.small}
          fill={styles.tileCaptionTextUnavailable.color}
        />
        <SmallBoldText style={styles.tileCaptionTextUnavailable}>{I18n.get('communities-tile-conversations-title')}</SmallBoldText>
      </View>
      <Pill text={I18n.get('communities-tile-soon')} color={theme.palette.grey.stone} />
    </View>
  );

  const pageContent = (
    <View style={styles.page}>
      <HeadingXSText>{title}</HeadingXSText>

      <View style={styles.tilesCol}>
        {membersTile}
        <View style={styles.tilesRow}>
          <View style={styles.tilesCol}>{documentsTile}</View>
          <View style={styles.tilesCol}>
            {coursesTile}
            {conversationTile}
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

  const bottomSheetModalRef = React.useRef<BottomSheetModalMethods>(null);
  React.useEffect(() => {
    (showWelcome && invitationId !== undefined ? bottomSheetModalRef.current?.present : bottomSheetModalRef.current?.dismiss)?.();
  }, [showWelcome, invitationId]);

  const invitation = useSelector(communitiesSelectors.getAllCommunities).find(
    item => item !== LOADING_ITEM_DATA && item.id === invitationId,
  ) as InvitationResponseDto | undefined;

  return (
    <>
      {statusBar}
      <ScrollView alwaysBounceVertical={false} refreshControl={refreshControl} {...scrollViewProps}>
        {scrollElements}
        {pageContent}
      </ScrollView>
      {invitation?.role && <CommunityWelcomeBottomSheetModal role={invitation?.role} title={title} ref={bottomSheetModalRef} />}
    </>
  );
};

export const CommunitiesHomeScreenPlaceholder = () => <View />;

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
      accountApi(moduleConfig, session, CommunityClient).getCommunity(communityId),
      accountApi(moduleConfig, session, MembershipClient).getMembers(communityId, { page: 1, size: 16 }),
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
