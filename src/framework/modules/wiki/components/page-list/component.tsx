import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { PageListProps, WikiListItemProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { FlatListProps } from '~/framework/components/list/flat-list';
import { BodyBoldText, BodyText } from '~/framework/components/text';
import IconChip from '~/framework/modules/wiki/components/icon-chip';

const WikiListItem: React.FC<WikiListItemProps> = props => {
  const {
    borderless,
    childrenIds,
    currentPageId,
    depth,
    id,
    index,
    isVisible,
    name,
    onPressItem: onPress,
    parentId,
    wikiData,
  } = props;
  const isCurrentPage = currentPageId === id;
  const hasChild = childrenIds.length > 0;

  const listItemStyle = React.useMemo(() => {
    const getChildItemStyle = () => {
      const previousPage = index > 0 ? wikiData.pages[index - 1] : undefined;
      const nextPage = index < wikiData.pages.length - 1 ? wikiData.pages[index + 1] : undefined;

      const isFirstChild = previousPage ? previousPage.id === parentId : false;
      const isLastChild = nextPage ? !nextPage.parentId || nextPage.parentId !== parentId : true;
      const parentHasChildren = nextPage && nextPage.parentId === id;
      if (!parentId || depth === 0 || borderless) return {};
      if (isFirstChild) {
        return [
          styles.firstChild,
          {
            borderBottomLeftRadius: parentHasChildren ? 0 : UI_SIZES.radius.card,
            borderBottomRightRadius: parentHasChildren ? 0 : UI_SIZES.radius.card,
          },
        ];
      } else if (isLastChild) {
        return styles.lastChild;
      } else if (!isFirstChild && !isLastChild) {
        return styles.middleChild;
      } else {
        return undefined;
      }
    };

    const getRootLevelItemStyle = () => {
      if (borderless) {
        return hasChild || depth === 0 ? styles.bottomSheetRootLevelItem : styles.bottomSheetChild;
      } else {
        return hasChild ? styles.listItemWithChild : styles.listItemChildless;
      }
    };

    const rootLevelItemStyle = getRootLevelItemStyle();
    const childItemStyle = borderless && parentId ? styles.bottomSheetChild : getChildItemStyle();

    return [rootLevelItemStyle, childItemStyle];
  }, [borderless, parentId, index, wikiData.pages, id, depth, hasChild]);

  const currentPageAttributes = React.useMemo(() => {
    return {
      iconChipContainerColor: isCurrentPage ? theme.palette.grey.white : theme.palette.complementary.blue.pale,
      style: isCurrentPage ? styles.bottomSheetFocusedItem : undefined,
    };
  }, [isCurrentPage]);

  const hiddenListItemTextStyle = React.useMemo(() => {
    return !isVisible ? styles.hiddenListItemText : undefined;
  }, [isVisible]);

  return (
    <View style={React.useMemo(() => [listItemStyle, currentPageAttributes.style], [currentPageAttributes.style, listItemStyle])}>
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
