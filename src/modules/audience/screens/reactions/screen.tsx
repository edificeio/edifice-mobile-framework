import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import type { StaticScreenProps } from '@react-navigation/native';
import { NavigationState, SceneRendererProps, Route as TabRoute, TabView } from 'react-native-tab-view';

import { defineModal } from '~/app/navigation-new';
import { BadgeAvatar, BadgePosition } from '~/framework/components/badgeAvatar';
import { EmptyConnectionScreen, EmptyScreen } from '~/framework/components/empty-screens';
import FlatList from '~/framework/components/list/flat-list';
import { LoadingIndicator } from '~/framework/components/loading';
import { Svg } from '~/framework/components/picture';
import { BodyText, CaptionBoldText, SmallBoldText, SmallText } from '~/framework/components/text';
import { ContentLoader } from '~/framework/hooks/loader';
import { accountTypeInfos } from '~/framework/util/accountType';
import { isEmpty } from '~/framework/util/object';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { loadReactionsPage } from '~/modules/audience/actions';
import type { AudienceReferer, AudienceUserReaction } from '~/modules/audience/model';
import { usePlatformReactionTypes } from '~/modules/audience/store';
import { getReactionIconName } from '~/modules/audience/util';
import { withSession } from '~/modules/auth/hoc';
import type { AuthActiveAccount } from '~/modules/auth/model';
import { I18n } from '~/util/i18n';

import styles from './styles';

// A type, not an interface: the params of a route must be a `Record<string, unknown>`
type AudienceReactionsScreenNavParams = {
  referer: AudienceReferer;
};

type ReactionsTabViewProps = SceneRendererProps & { navigationState: NavigationState<{ key: string }> };

const PAGE_SIZE = 20;
const NO_REACTION_TYPES: string[] = [];

const ReactionTab = ({ count, focused, reactionType }: { count: number; focused: boolean; reactionType: string }) => {
  const TextComponent = focused ? SmallBoldText : SmallText;
  const textStyle = focused ? styles.headerItemTextFocused : undefined;
  if (reactionType === 'all') return <TextComponent style={textStyle}>{I18n.get('audience-reactions-all')}</TextComponent>;
  const iconName = getReactionIconName(reactionType);
  return (
    <View style={styles.headerItem}>
      {iconName ? <Svg name={iconName} /> : null}
      <TextComponent style={textStyle}>{count}</TextComponent>
    </View>
  );
};

const ReactionItem = React.memo(({ item }: { item: AudienceUserReaction }) => {
  const badgeIconName = getReactionIconName(item.reactionType, true);
  return (
    <View style={styles.item}>
      <BadgeAvatar
        userId={item.userId}
        badgeContent={badgeIconName ? { name: badgeIconName, type: 'Svg' } : undefined}
        badgePosition={BadgePosition.bottom}
      />
      <View>
        <BodyText>{item.displayName}</BodyText>
        <CaptionBoldText>{accountTypeInfos[item.profile].text}</CaptionBoldText>
      </View>
    </View>
  );
});

const renderReactionItem = ({ item }: { item: AudienceUserReaction }) => <ReactionItem item={item} />;

const AudienceReactionsScreen = ({
  route,
  session,
}: StaticScreenProps<AudienceReactionsScreenNavParams> & { session: AuthActiveAccount }) => {
  const { module, resourceId, resourceType } = route.params.referer;
  const validReactionTypes = usePlatformReactionTypes(session.platform.name) ?? NO_REACTION_TYPES;

  const [userReactions, setUserReactions] = React.useState<AudienceUserReaction[]>([]);
  const [index, setIndex] = React.useState(0);
  const routes = React.useMemo(
    () => [{ key: 'all' }, ...validReactionTypes.map(reactionType => ({ key: reactionType }))],
    [validReactionTypes],
  );
  const [countByType, setCountByType] = React.useState<Record<string, number>>({});
  const [nextPageToFetchState, setNextPageToFetch] = React.useState(1);
  const [loadingState, setLoadingState] = React.useState(AsyncPagedLoadingState.PRISTINE);

  const listFooterComponent = React.useMemo(
    () => (
      <>
        {loadingState === AsyncPagedLoadingState.FETCH_NEXT ? <LoadingIndicator withVerticalMargins /> : null}
        <View style={styles.listFooter} />
      </>
    ),
    [loadingState],
  );

  const loadData = React.useCallback(async () => {
    if (nextPageToFetchState < 0) return;
    try {
      const dt = await loadReactionsPage({ module, resourceId, resourceType }, nextPageToFetchState, PAGE_SIZE);
      setNextPageToFetch(dt.userReactions.length === 0 ? -1 : nextPageToFetchState + 1);
      setUserReactions([...userReactions, ...dt.userReactions]);
      // ToDo(audience-migration): the counters are read once, with the first page (fiche §5).
      if (isEmpty(countByType)) setCountByType(dt.reactionCounters.countByType);
    } catch (e) {
      console.error('[AudienceReactionsScreen] error :', e);
      throw e;
    }
  }, [countByType, module, nextPageToFetchState, resourceId, resourceType, userReactions]);

  const fetchNextPage = React.useCallback(() => {
    if (loadingState === AsyncPagedLoadingState.FETCH_NEXT) return;
    setLoadingState(AsyncPagedLoadingState.FETCH_NEXT);
    loadData()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.FETCH_NEXT_FAILED));
  }, [loadData, loadingState]);

  const onEndReached = React.useCallback(() => {
    if (userReactions.length >= (nextPageToFetchState - 1) * PAGE_SIZE) fetchNextPage();
  }, [fetchNextPage, nextPageToFetchState, userReactions.length]);

  const renderScene = React.useCallback(
    ({ route: tabRoute }: { route: TabRoute }) => {
      const data =
        tabRoute.key === 'all' ? userReactions : userReactions.filter(reaction => reaction.reactionType === tabRoute.key);
      return (
        <FlatList
          data={data}
          renderItem={renderReactionItem}
          bounces={!isEmpty(data)}
          ListEmptyComponent={
            <EmptyScreen
              svgImage="empty-timeline"
              title={I18n.get('audience-reactions-empty')}
              customTitleStyle={styles.noReactionTitle}
              customStyle={styles.noReactionView}
            />
          }
          contentContainerStyle={styles.flatlist}
          ListFooterComponent={listFooterComponent}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
        />
      );
    },
    [listFooterComponent, onEndReached, userReactions],
  );

  const renderTabBar = React.useCallback(
    (tabBarProps: ReactionsTabViewProps) => (
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBarContentContainer}>
          {tabBarProps.navigationState.routes.map((tabRoute, i) => {
            const focused = i === tabBarProps.navigationState.index;
            return (
              <TouchableOpacity
                key={tabRoute.key}
                style={[styles.headerItem, styles.tabbarItem]}
                activeOpacity={0.7}
                onPress={() => tabBarProps.jumpTo(tabRoute.key)}>
                <ReactionTab reactionType={tabRoute.key} count={countByType[tabRoute.key] ?? 0} focused={focused} />
                {focused ? <View style={styles.tabBarIndicator} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    ),
    [countByType],
  );

  const navigationState = React.useMemo(() => ({ index, routes }), [index, routes]);

  const renderContent = React.useCallback(
    () => (
      <View style={styles.container}>
        <TabView navigationState={navigationState} onIndexChange={setIndex} renderScene={renderScene} renderTabBar={renderTabBar} />
      </View>
    ),
    [navigationState, renderScene, renderTabBar],
  );

  return <ContentLoader loadContent={loadData} renderContent={renderContent} renderError={renderError} />;
};

const renderError = () => <EmptyConnectionScreen />;

export default defineModal({
  options: () => ({
    title: I18n.get('audience-reactions-title'),
  }),
  screen: withSession<StaticScreenProps<AudienceReactionsScreenNavParams>>(AudienceReactionsScreen),
});
