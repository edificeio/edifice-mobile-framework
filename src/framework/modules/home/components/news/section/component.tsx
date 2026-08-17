import * as React from 'react';
import { ListRenderItemInfo, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { HeadingSText } from '~/framework/components/text';
import { NewsCard } from '~/framework/modules/home/components/news/card';
import { Carousel, useTabSwipeLock } from '~/framework/modules/home/components/news/carousel';
import { NewsEmpty } from '~/framework/modules/home/components/news/empty';
import { NewsPlaceholder } from '~/framework/modules/home/components/news/placeholder';
import type { HomeNewsItem } from '~/framework/modules/home/components/news/types';

import styles from './styles';
import { NewsSectionProps } from './types';

const keyExtractor = (item: HomeNewsItem) => String(item.news.id);

export const NewsSection = React.memo(({ loading, news, onPressItem, onSeeMore }: NewsSectionProps) => {
  const tabSwipeLock = useTabSwipeLock();

  const renderItem = React.useCallback(
    ({ item }: ListRenderItemInfo<HomeNewsItem>) => <NewsCard item={item} onPress={onPressItem} />,
    [onPressItem],
  );

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
        <Carousel {...tabSwipeLock} data={news} keyExtractor={keyExtractor} renderItem={renderItem} />
      ) : (
        <NewsEmpty />
      )}
    </View>
  );
});
