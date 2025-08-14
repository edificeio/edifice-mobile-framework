import * as React from 'react';
import { Image, Platform, ScrollViewProps, StatusBar, TouchableOpacity, View } from 'react-native';

import { CommunityClient, MembershipClient } from '@edifice.io/community-client-rest-rn';
import { HeaderBackButton } from '@react-navigation/elements';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CommunityScrollViewStickyHeader, { BANNER_ACCELERATION } from './sticky-component';
import styles from './styles';
import type { CommunitiesHomeScreen } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { AvatarStack } from '~/framework/components/avatar/stack';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { EmptyContent } from '~/framework/components/empty-screens/base/component';
import { Svg } from '~/framework/components/picture';
import Pill from '~/framework/components/pill';
import { sessionScreen } from '~/framework/components/screen';
import ScrollView from '~/framework/components/scrollView';
import { HeadingXSText, SmallBoldText, SmallText } from '~/framework/components/text';
import { ContentLoader, ContentLoaderProps } from '~/framework/hooks/loader';
import CommunityNavbar from '~/framework/modules/communities/components/community-navbar';
import { BANNER_BASE_HEIGHT } from '~/framework/modules/communities/components/community-navbar/styles';
import moduleConfig from '~/framework/modules/communities/module-config';
import { CommunitiesNavigationParams, communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import http from '~/framework/util/http';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<CommunitiesNavigationParams, typeof communitiesRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: '',
  }),
  headerLeft: props => (
    <HeaderBackButton
      {...props}
      labelVisible={false}
      style={styles.navBarButton}
      onPress={navigation.goBack}
      backImage={Platform.select({
        default: undefined,
        ios: () => (
          <Image
            style={styles.backButtonImage}
            source={require('@react-navigation/elements/src/assets/back-icon.png')}
            fadeDuration={0}
          />
        ),
      })}
      tintColor={theme.ui.text.regular.toString()}
    />
  ),
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: 'transparent',
  },
  headerTransparent: true,
});

export const CommunitiesHomeScreenLoaded = function ({
  image,
  membersId,
  navigation,
  refreshControl,
  route: {
    params: { communityId },
  },
  title,
  totalMembers,
}: Readonly<CommunitiesHomeScreen.AllPropsLoaded>) {
  const { top: statusBarHeight } = useSafeAreaInsets();
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

  const fixedTitleHeaderStyle = React.useMemo(
    () => [
      styles.titleHeaderWrapper,
      {
        height: UI_SIZES.elements.navbarHeight + statusBarHeight,
        paddingTop: statusBarHeight,
      },
    ],
    [statusBarHeight],
  );
  const fixedTitleHeader = (
    <View style={fixedTitleHeaderStyle}>
      <View style={styles.titleHeaderInner}>
        <HeadingXSText numberOfLines={1}>{title}</HeadingXSText>
      </View>
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

  const banner = <CommunityNavbar image={image} />;

  const bannerTotalHeight = BANNER_BASE_HEIGHT + statusBarHeight;

  const [shouldStatusBarDark, setShouldStatusBarDark] = React.useState(false);
  const onScroll = React.useCallback<NonNullable<ScrollViewProps['onScroll']>>(
    ({ nativeEvent }) => {
      const newShouldStatusBarDark =
        nativeEvent.contentInset.top + nativeEvent.contentOffset.y + statusBarHeight / 2 >
        bannerTotalHeight * (1 / BANNER_ACCELERATION);
      if (shouldStatusBarDark !== newShouldStatusBarDark) setShouldStatusBarDark(newShouldStatusBarDark);
    },
    [bannerTotalHeight, shouldStatusBarDark, statusBarHeight],
  );

  const contentContainerStyle = React.useMemo(
    () =>
      Platform.select({
        default: undefined,
        ios: { marginTop: -bannerTotalHeight },
      }),
    [bannerTotalHeight],
  );
  const contentInset = React.useMemo(
    () =>
      Platform.select({
        default: undefined,
        ios: {
          bottom: -bannerTotalHeight,
          top: bannerTotalHeight,
        },
      }),
    [bannerTotalHeight],
  );
  const contentOffset = React.useMemo(
    () =>
      Platform.select({
        default: undefined,
        ios: { x: 0, y: -bannerTotalHeight },
      }),
    [bannerTotalHeight],
  );

  // Note: Weird ScrollView contentContainerStyle behaviour with vertical padding, so we use an inner View to apply the page style (iOS only).
  // Beware : ScrollView children order matters ! This establish the zIndex of the elements relative to each other.
  //          Also, position (as "index") is used to reference which elements are stiucky and how (with `stickyHeaderIndices` and `StickyHeaderComponent`).
  return (
    <>
      <StatusBar
        animated
        backgroundColor={'transparent'}
        barStyle={shouldStatusBarDark ? 'dark-content' : 'light-content'}
        translucent
      />
      <ScrollView
        alwaysBounceVertical={false}
        contentContainerStyle={contentContainerStyle}
        contentInset={contentInset}
        contentOffset={contentOffset}
        onScroll={onScroll}
        refreshControl={refreshControl}
        StickyHeaderComponent={CommunityScrollViewStickyHeader}
        stickyHeaderIndices={CommunitiesHomeScreenLoaded.stickyHeaderIndices}>
        {fixedTitleHeader}
        {banner}
        {pageContent}
      </ScrollView>
    </>
  );
};
CommunitiesHomeScreenLoaded.stickyHeaderIndices = [0, 1];

export const CommunitiesHomeScreenPlaceholder = () => <View />;

export default sessionScreen<CommunitiesHomeScreen.AllProps>(function CommunitiesHomeScreen({
  navigation,
  route,
  route: {
    params: { communityId },
  },
  session,
}) {
  const [data, setData] = React.useState<CommunitiesHomeScreen.RequiredData>();

  const loadContent = React.useCallback(async () => {
    const [community, members] = await Promise.all([
      http.api(moduleConfig, session, CommunityClient).getCommunity(communityId),
      http.api(moduleConfig, session, MembershipClient).getMembers(communityId, { page: 1, size: 16 }),
    ]);
    setData({
      ...community,
      membersId: members.items.map(item => item.user.entId),
      totalMembers: members.meta.totalItems,
    });
  }, [communityId, session]);

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
