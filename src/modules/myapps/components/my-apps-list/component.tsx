import React from 'react';
import { View } from 'react-native';

import { FlashList, FlashListProps, ListRenderItem } from '@shopify/flash-list';

import { EmptyScreen } from '~/framework/components/empty-screens';
import { SmallBoldText } from '~/framework/components/text';
import { MyAppsCard } from '~/modules/myapps/components/my-apps-card/component';
import { I18n } from '~/util/i18n';

import { styles } from './styles';
import { MyAppsListItem, MyAppsListProps } from './types';
import { buildAllAppsCategoryList, buildAppItem, isSeparator } from './utils';

const NUM_COLUMNS = 2;

const keyExtractor = (item: MyAppsListItem, index: number) => (isSeparator(item) ? `separator-${index}` : item.item.app.name);

const getItemType = (item: MyAppsListItem) => item.type;

// The separator takes the whole row; its height is the one of its content
const overrideItemLayout: FlashListProps<MyAppsListItem>['overrideItemLayout'] = (layout, item) => {
  layout.span = isSeparator(item) ? NUM_COLUMNS : 1;
};

const Separator = () => (
  <View style={styles.separatorContainer}>
    <View style={styles.separatorLine} />
    <SmallBoldText style={styles.separatorText}>{I18n.get('myapp-home-filter-favorites-other-services')}</SmallBoldText>
  </View>
);

/** The apps of a filter, on 2 columns. The filter « all » puts the other services at the end, after a separator. */
export const MyAppsList = ({
  apps,
  emptyScreenConfig,
  isAllAppsFilter,
  onLongPressApp,
  onPressApp,
  onRefresh,
  ref,
  refreshing,
}: MyAppsListProps) => {
  const { testID, text, title } = emptyScreenConfig;

  const data = React.useMemo(
    () => (isAllAppsFilter ? buildAllAppsCategoryList(apps) : apps.map(buildAppItem)),
    [apps, isAllAppsFilter],
  );

  const renderItem = React.useCallback<ListRenderItem<MyAppsListItem>>(
    ({ item }) =>
      isSeparator(item) ? <Separator /> : <MyAppsCard item={item.item} onPress={onPressApp} onLongPress={onLongPressApp} />,
    [onPressApp, onLongPressApp],
  );

  const emptyComponent = React.useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <EmptyScreen svgImage="empty-search" title={I18n.get(title)} text={I18n.get(text)} testID={testID} />
      </View>
    ),
    [title, text, testID],
  );

  return (
    <FlashList
      ref={ref}
      data={data}
      numColumns={NUM_COLUMNS}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      getItemType={getItemType}
      overrideItemLayout={overrideItemLayout}
      contentContainerStyle={styles.content}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListEmptyComponent={emptyComponent}
    />
  );
};

export default MyAppsList;
