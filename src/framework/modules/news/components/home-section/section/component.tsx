import * as React from 'react';
import { FlatList, ListRenderItemInfo, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { HeadingSText } from '~/framework/components/text';
import type { AuthActiveAccount } from '~/framework/modules/auth/model';
import { useHomeReload } from '~/framework/modules/home/hooks';
import { NewsCard } from '~/framework/modules/news/components/home-section/card';
import { NewsEmpty } from '~/framework/modules/news/components/home-section/empty';
import { NewsPager, NewsPagerHandle } from '~/framework/modules/news/components/home-section/pager';
import { NewsPlaceholder } from '~/framework/modules/news/components/home-section/placeholder';
import type { HomeNewsItem } from '~/framework/modules/news/components/home-section/types';
import { useHomeNews } from '~/framework/modules/news/hooks';
import { newsRouteNames } from '~/framework/modules/news/navigation';
import { getNewsRights } from '~/framework/modules/news/rights';

import { CARD_SNAP_INTERVAL } from '../constants';
import styles from './styles';
import { NewsHomeSectionProps } from './types';

const keyExtractor = (item: HomeNewsItem) => String(item.news.id);

export const hasNews = (session: AuthActiveAccount) => getNewsRights(session).view;

export const NewsHomeSection = React.memo(({ session }: NewsHomeSectionProps) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { load, news } = useHomeNews(session);
  const listRef = React.useRef<FlatList<HomeNewsItem>>(null);
  const pagerRef = React.useRef<NewsPagerHandle>(null);

  // Loads on mount, then every time the home is opened again or pulled down.
  const loading = useHomeReload(load);

  const onSeeMore = React.useCallback(() => navigation.navigate(newsRouteNames.home, {}), [navigation]);

  const onPressItem = React.useCallback(
    (item: HomeNewsItem) => navigation.navigate(newsRouteNames.details, { news: item.news, thread: item.thread }),
    [navigation],
  );

  const onCardPress = React.useCallback(
    (item: HomeNewsItem) => {
      const index = news.indexOf(item);
      if (index === pagerRef.current?.getSnappedIndex()) return onPressItem(item);

      listRef.current?.scrollToOffset({ animated: true, offset: index * CARD_SNAP_INTERVAL });
    },
    [news, onPressItem],
  );

  const renderItem = React.useCallback(
    ({ item }: ListRenderItemInfo<HomeNewsItem>) => <NewsCard item={item} onPress={onCardPress} />,
    [onCardPress],
  );

  const renderLoading = () => <NewsPlaceholder />;

  const renderEmpty = () => <NewsEmpty />;

  const renderNews = () => (
    <NewsPager
      listRef={listRef}
      pagerRef={pagerRef}
      data={news}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      // The row stops on a card, one per drag, instead of wherever the finger left it.
      snapToInterval={CARD_SNAP_INTERVAL}
      snapToAlignment="start"
      decelerationRate="fast"
      disableIntervalMomentum
    />
  );

  const renderContent = () => {
    if (loading) return renderLoading();
    if (!news.length) return renderEmpty();
    return renderNews();
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <HeadingSText style={styles.title}>{I18n.get('home-news-title')}</HeadingSText>
        <TertiaryButton
          text={I18n.get('home-news-seemore')}
          iconRight="ui-arrowRight"
          contentColor={theme.palette.secondary.dark}
          action={onSeeMore}
        />
      </View>
      {renderContent()}
    </View>
  );
});
