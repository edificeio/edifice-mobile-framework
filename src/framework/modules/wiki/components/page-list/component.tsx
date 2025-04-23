import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { PageListProps, WikiListItemProps } from './types';

import theme from '~/app/theme';
import { FlatListProps } from '~/framework/components/list/flat-list';
import { BodyBoldText, BodyText } from '~/framework/components/text';
import IconChip from '~/framework/modules/wiki/components/icon-chip';

const WikiListItem: React.FC<WikiListItemProps> = props => {
  const { borderless, currentPageId, depth, id, index, isVisible, name, onPressItem: onPress, parentId, wikiData } = props;
  const isCurrentPage = currentPageId === id;

  const currentPageAttributes = React.useMemo(() => {
    return {
      iconChipContainerColor: isCurrentPage ? theme.palette.grey.white : theme.palette.complementary.blue.pale,
      style: isCurrentPage ? styles.bottomSheetFocusedItem : undefined,
    };
  }, [isCurrentPage]);

  const hiddenListItemTextStyle = React.useMemo(() => {
    return !isVisible ? styles.hiddenListItemText : undefined;
  }, [isVisible]);

  // Compute siblings info the putt he right style properties

  const previousPage = index > 0 ? wikiData.pages[index - 1] : undefined;
  const nextPage = index < wikiData.pages.length - 1 ? wikiData.pages[index + 1] : undefined;
  const isParent = depth === 0;
  const isParentWithChildren = isParent && nextPage && nextPage.parentId === id;
  const isFirstChild = !isParent && previousPage ? previousPage.id === parentId : false;
  const isLastChild = !isParent && (nextPage ? !nextPage.parentId || nextPage.parentId !== parentId : true);

  const listItemLayoutStyle = React.useMemo(
    () => [
      styles.listItemLayoutCommon,
      borderless ? styles.listItemLayoutBorderless : styles.listItemLayoutBordered,
      isParent
        ? [styles.listItemLayoutParent, borderless ? styles.listItemLayoutParentBorderless : styles.listItemLayoutParentBordered]
        : [styles.listItemLayoutChild, borderless ? styles.listItemLayoutChildBorderless : styles.listItemLayoutChildBordered],
      isParentWithChildren
        ? [
            styles.listItemLayoutParentWithChildren,
            borderless ? styles.listItemLayoutParentWithChildrenBorderless : styles.listItemLayoutParentWithChildrenBordered,
          ]
        : undefined,
      isFirstChild
        ? [
            styles.listItemLayoutChildFirst,
            borderless ? styles.listItemLayoutChildFirstBorderless : styles.listItemLayoutChildFirstBordered,
          ]
        : undefined,
      isLastChild
        ? [
            styles.listItemLayoutChildLast,
            borderless ? styles.listItemLayoutChildLastBorderless : styles.listItemLayoutChildLastBordered,
          ]
        : undefined,
    ],
    [borderless, isFirstChild, isLastChild, isParent, isParentWithChildren],
  );

  return (
    <View
      style={React.useMemo(
        () => [listItemLayoutStyle, currentPageAttributes.style],
        [currentPageAttributes.style, listItemLayoutStyle],
      )}>
      <TouchableOpacity
        onPress={React.useCallback(() => {
          onPress?.(id);
        }, [onPress, id])}>
        <View style={styles.listItemContent}>
          {isCurrentPage ? (
            <BodyBoldText numberOfLines={1} ellipsizeMode="tail" style={hiddenListItemTextStyle}>
              {name}
            </BodyBoldText>
          ) : (
            <BodyText numberOfLines={1} ellipsizeMode="tail" style={hiddenListItemTextStyle}>
              {name}
            </BodyText>
          )}
          {!isVisible && (
            <IconChip
              icon="ui-hide"
              iconColor={theme.palette.complementary.blue.regular}
              iconContainerColor={currentPageAttributes.iconChipContainerColor}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const ItemSeparatorComponent = () => <View style={styles.spacingItem} />;

export const PageList: React.FC<PageListProps> = ({
  borderless = false,
  currentPageId,
  ListComponent,
  ListEmptyComponent,
  ListFooterComponent,
  ListHeaderComponent,
  onPressItem: onPress,
  refreshControl,
  wikiData,
}) => {
  const listContainerStyle = React.useMemo(() => {
    return borderless ? styles.bottomSheetListContainer : styles.listContainer;
  }, [borderless]);

  const renderItem = React.useCallback(
    ({ index, item }) => (
      <WikiListItem
        borderless={borderless}
        childrenIds={item.childrenIds}
        currentPageId={currentPageId}
        depth={item.depth}
        id={item.id}
        isVisible={item.isVisible}
        name={item.title}
        onPressItem={onPress}
        parentId={item.parentId}
        position={item.position}
        wikiData={wikiData}
        index={index}
      />
    ),
    [currentPageId, borderless, onPress, wikiData],
  );

  return (
    <ListComponent
      bottomInset={false}
      contentContainerStyle={listContainerStyle}
      data={wikiData?.pages}
      ItemSeparatorComponent={ItemSeparatorComponent}
      ListFooterComponent={ListFooterComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={refreshControl}
      renderItem={renderItem}
      keyExtractor={React.useCallback<
        NonNullable<FlatListProps<NonNullable<PageListProps['wikiData']['pages'][0]>>['keyExtractor']>
      >(item => item.id, [])}
    />
  );
};
