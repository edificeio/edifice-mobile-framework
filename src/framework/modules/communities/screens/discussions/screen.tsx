import * as React from 'react';
import { View } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';
import { useSelector } from 'react-redux';
import { PlaceholderLine } from 'rn-placeholder';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import { getScaleImageSize } from '~/framework/components/constants';
import { EmptyContent } from '~/framework/components/empty-screens/base/component';
import { LOADING_ITEM_DATA, PaginatedFlatListProps, staleOrSplice } from '~/framework/components/list/paginated-list';
import { HeadingXSText } from '~/framework/components/text';
import { withSession } from '~/framework/modules/auth/util';
import DiscussionCard, { DiscussionCardLoader } from '~/framework/modules/communities/components/discussion-card';
import DecoratedPaginatedFlatList from '~/framework/modules/communities/components/list/decorated-paginated-list';
import useCommunityScrollableThumbnail, { communityNavBar } from '~/framework/modules/communities/hooks/use-community-navbar';
import { Discussion, getDiscussions } from '~/framework/modules/communities/service/discussions';
import { communitiesSelectors } from '~/framework/modules/communities/store';
import { getCommunityBannerImage } from '~/framework/modules/communities/utils';
import { openUrl } from '~/framework/util/linking';

import styles from './styles';
import { CommunitiesDiscussionsScreen } from './types';

const EMPTY_SVG_HEIGHT = 150;
const EMPTY_SVG_WIDTH = 250;
const PAGE_SIZE = 20;

export const DiscussionsScreenOptions = screenOptions(props => communityNavBar(props, () => {}, 'ui-plus'));

const DiscussionCardPlaceholder = () => (
  <View style={styles.itemContainer}>
    <DiscussionCardLoader />
  </View>
);

export default withSession<CommunitiesDiscussionsScreen.AllProps>(function DiscussionsScreen({
  navigation,
  route,
  route: {
    params: { communityId },
  },
  session,
}) {
  const communityData = useSelector(communitiesSelectors.getCommunityDetails(communityId));
  const [discussions, setDiscussions] = React.useState<(Discussion | typeof LOADING_ITEM_DATA)[]>([]);

  const loadData = React.useCallback(
    async (page: number, reloadAll?: boolean) => {
      try {
        const { discussions: newDiscussions, total } = await getDiscussions(session, communityId, page, PAGE_SIZE);

        setDiscussions(prevData =>
          staleOrSplice({
            newData: newDiscussions,
            previousData: prevData,
            reloadAll,
            start: page * PAGE_SIZE,
            total,
          }),
        );
      } catch (e) {
        console.error('Error while loading community discussions list', e);
      }
    },
    [communityId, session],
  );

  const keyExtractor = React.useCallback<NonNullable<PaginatedFlatListProps<Discussion>['keyExtractor']>>(
    item => item.id.toString(),
    [],
  );

  // Temporary web redirection until the discussion screens exist
  const platformUrl = session.platform.url;
  const discussionsUrl = `${platformUrl}/communities/id/${communityId}/discussions`;
  const redirectToWeb = React.useCallback((discussionId: number) => openUrl(`${discussionsUrl}/${discussionId}`), [discussionsUrl]);
  const redirectToDiscussionsWeb = React.useCallback(() => openUrl(discussionsUrl), [discussionsUrl]);

  React.useEffect(() => {
    navigation.setOptions(communityNavBar({ navigation, route }, redirectToDiscussionsWeb, 'ui-plus'));
  }, [navigation, redirectToDiscussionsWeb, route]);

  const renderItem = React.useCallback(
    ({ item }: { item: Discussion }) => (
      <View style={styles.itemContainer}>
        <DiscussionCard
          isHidden={!!item.hiddenAt}
          isLocked={!!item.lockedAt}
          lastMessageDate={Temporal.Instant.from(new Date(item.lastMessageTime).toISOString())}
          membersDisplayed={(item.firstUsers ?? []).map(user => user.entId)}
          membersTotal={item.nUsers}
          newContent={{ hasNewContent: item.hasUnreadMessages, messagesCount: item.unreadCount }}
          responsesCount={item.nMessages}
          title={item.title}
          type={item.icon}
          onPress={() => redirectToWeb(item.id)}
        />
      </View>
    ),
    [redirectToWeb],
  );

  const image = React.useMemo(() => getCommunityBannerImage(communityData), [communityData]);

  const [scrollElements, scrollViewProps, placeholderBanner] = useCommunityScrollableThumbnail({
    contentContainerStyle: styles.list,
    image,
    navigation,
    title: I18n.get('communities-tile-discussions-title'),
  });

  const stickyElements = React.useMemo(
    () => [
      ...scrollElements,
      <HeadingXSText key="title" style={styles.title}>
        {I18n.get('communities-tile-discussions-title')}
      </HeadingXSText>,
    ],
    [scrollElements],
  );

  const stickyPlaceholderElements = React.useMemo(
    () => [placeholderBanner, <PlaceholderLine key="title" noMargin style={styles.titlePlaceholder} width={60} />],
    [placeholderBanner],
  );

  return (
    <DecoratedPaginatedFlatList
      data={discussions}
      decorations={stickyElements}
      keyExtractor={keyExtractor}
      ListEmptyComponent={
        <EmptyContent
          button={{
            action: redirectToDiscussionsWeb,
            icon: 'ui-external-link',
            text: I18n.get('communities-discussions-empty-create-button'),
          }}
          extraStyle={styles.emptyContent}
          svg="empty-conversation"
          svgHeight={getScaleImageSize(EMPTY_SVG_HEIGHT)}
          svgWidth={getScaleImageSize(EMPTY_SVG_WIDTH)}
          text={I18n.get('communities-discussions-empty-create-text')}
          title={I18n.get('communities-discussions-empty-create-title')}
        />
      }
      onPageReached={loadData}
      pageSize={PAGE_SIZE}
      placeholderDecorations={stickyPlaceholderElements}
      renderItem={renderItem}
      renderPlaceholderItem={DiscussionCardPlaceholder}
      {...scrollViewProps}
    />
  );
});
