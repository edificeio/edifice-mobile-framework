import React from 'react';
import { View } from 'react-native';

import { FlashList, ListRenderItem } from '@shopify/flash-list';

import { styles } from './styles';
import { MyAppsListItem, MyAppsListProps } from './types';
import { buildAllAppsCategoryList, buildAppItem, isSeparator } from './utils';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';
import { SmallBoldText } from '~/framework/components/text';
import { MyAppsCard } from '~/framework/modules/myapps/components';

const NUM_COLUMNS = 2;

export const MyAppsList = React.forwardRef<FlashList<MyAppsListItem>, MyAppsListProps>(
  ({ apps, emptyScreenConfig, isAllAppsFilter, onLongPressApp, onPressApp, onRefresh, refreshing }, forwardedRef) => {
    const localRef = React.useRef<FlashList<MyAppsListItem>>(null);
    const appsListRef = forwardedRef || localRef;
    const { testID, text, title } = emptyScreenConfig;

    const data: MyAppsListItem[] = React.useMemo(() => {
      return isAllAppsFilter ? buildAllAppsCategoryList(apps) : apps.map(buildAppItem);
    }, [apps, isAllAppsFilter]);

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

    const renderItem = React.useCallback<ListRenderItem<MyAppsListItem>>(
      ({ item }) => {
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
            isAllAppsFilter={isAllAppsFilter}
            app={item.app}
            onPress={() => onPressApp(item.app)}
            onLongPress={() => onLongPressApp?.(item.app)}
          />
        );
      },
      [isAllAppsFilter, onPressApp, onLongPressApp],
    );

    const renderEmptyComponent = React.useMemo(
      () => (
        <View style={styles.emptyContainer}>
          <EmptyScreen svgImage="empty-search" title={I18n.get(title)} text={I18n.get(text)} testID={testID} />
        </View>
      ),
      [title, text, testID],
    );

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
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={renderEmptyComponent}
      />
    );
  },
);

export default MyAppsList;
