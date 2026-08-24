import * as React from 'react';
import { FlatList, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { HeadingSText } from '~/framework/components/text';
import { NewsCard } from '~/framework/modules/home/components/news/card';
import { Carousel } from '~/framework/modules/home/components/news/carousel';
import { NewsEmpty } from '~/framework/modules/home/components/news/empty';
import { NewsPlaceholder } from '~/framework/modules/home/components/news/placeholder';
import type { HomeNewsItem } from '~/framework/modules/home/components/news/types';

import { CARD_SNAP_INTERVAL } from '../constants';
import styles from './styles';
import { NewsSectionProps } from './types';

const keyExtractor = (item: HomeNewsItem) => String(item.news.id);

export const NewsSection = React.memo(({ canView, loading, news, onPressItem, onSeeMore }: NewsSectionProps) => {
  const listRef = React.useRef<FlatList<HomeNewsItem>>(null);
  const scrolled = React.useRef<number>(0);

  const onScroll = React.useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrolled.current = event.nativeEvent.contentOffset.x;
  }, []);

  const onCardPress = React.useCallback(
    (item: HomeNewsItem) => {
      const index = news.indexOf(item);
      if (index === Math.round(scrolled.current / CARD_SNAP_INTERVAL)) return onPressItem(item);

      listRef.current?.scrollToOffset({ animated: true, offset: index * CARD_SNAP_INTERVAL });
    },
    [news, onPressItem],
  );

  const renderItem = React.useCallback(
    ({ item }: ListRenderItemInfo<HomeNewsItem>) => <NewsCard item={item} onPress={onCardPress} />,
    [onCardPress],
  );

  if (!canView) return null;

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
      {loading ? (
        <NewsPlaceholder />
      ) : news.length ? (
        <Carousel
          listRef={listRef}
          data={news}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          onScroll={onScroll}
          scrollEventThrottle={16}
          // The row stops on a card, one per drag, instead of wherever the finger left it.
          snapToInterval={CARD_SNAP_INTERVAL}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
        />
      ) : (
        <NewsEmpty />
      )}
    </View>
  );
});
