import React from 'react';
import { View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { styles } from './styles';
import { MyAppsListItem, MyAppsListProps } from './types';
import { buildAppItem, buildFavoritesList, isSeparator } from './utils';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { SmallBoldText } from '~/framework/components/text';
import { MyAppsCard } from '~/framework/modules/myAppMenu/components/my-apps-card';

const NUM_COLUMNS = 2;

export const MyAppsList = ({ apps, emptyScreenConfig, isFavoritesFilter, onLongPressApp, onPressApp }: MyAppsListProps) => {
  const appsListRef = React.useRef<FlashList<MyAppsListItem>>(null);

  const data: MyAppsListItem[] = React.useMemo(() => {
    return isFavoritesFilter ? buildFavoritesList(apps) : apps.map(buildAppItem);
  }, [apps, isFavoritesFilter]);

  const keyExtractor = React.useCallback(
    (item: MyAppsListItem, index: number) => (isSeparator(item) ? `separator-${index}` : item.app.name),
    [],
  );

  const getItemType = React.useCallback((item: MyAppsListItem) => item.type, []);

  const overrideItemLayout = React.useCallback((layout, item: MyAppsListItem) => {
    if (item.type === 'separator') {
      layout.span = NUM_COLUMNS;
      layout.size = 40;
    } else {
      layout.span = 1;
    }
  }, []);

  const renderItem = React.useCallback(
    ({ item }: { item: MyAppsListItem }) => {
      if (isSeparator(item)) {
        return (
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <SmallBoldText style={styles.separatorText}>{I18n.get('myapp-home-filter-favorites-other-services')}</SmallBoldText>
          </View>
        );
      }

      return (
        <MyAppsCard
          isFavoritesFilter={isFavoritesFilter}
          app={item.app}
          onPress={() => onPressApp(item.app)}
          onLongPress={() => onLongPressApp?.(item.app)}
        />
      );
    },
    [isFavoritesFilter, onPressApp, onLongPressApp],
  );

  if (!data.length) {
    const { text, title } = emptyScreenConfig;
    return (
      <View style={styles.emptyContainer}>
        <EmptyScreen svgImage="empty-search" title={I18n.get(title)} text={I18n.get(text)} />
      </View>
    );
  }

  return (
    <FlashList
      ref={appsListRef}
      data={data}
      numColumns={NUM_COLUMNS}
      estimatedItemSize={120}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      getItemType={getItemType}
      overrideItemLayout={overrideItemLayout}
      contentContainerStyle={styles.content}
    />
  );
};

export default MyAppsList;
