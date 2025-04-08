import React from 'react';
import { FlatList, FlatListProps, TouchableOpacity, View } from 'react-native';

import styles from './styles';

import { I18n } from '~/app/i18n';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { UI_SIZES } from '~/framework/components/constants';
import { BodyText, HeadingMText } from '~/framework/components/text';
import type { Wiki, WikiPage } from '~/framework/modules/wiki/model';

interface WikiListItemProps {
  name: string;
  depth: number;
  id: string;
  onPress: () => void;
  position: number;
  isVisible: boolean;
  childrenIds: string[];
  parentId?: string;
  wikiData: any;
}

export const PageListTitle: React.FC = () => {
  return <HeadingMText style={styles.pageListTitle}>{I18n.get('wiki-pagelist-title')}</HeadingMText>;
};

const WikiListItem: React.FC<WikiListItemProps> = props => {
  const hasChild = props.childrenIds.length > 0;

  const listItemStyle = React.useMemo(() => {
    const getChildPositionStyle = () => {
      if (!props.parentId) return {};
      const parent = props.wikiData.pages.find((page: any) => page.id === props.parentId);
      const childArray = parent.childrenIds;
      const childIndex = childArray.indexOf(props.id);
      const parentHasChildren = parent.childrenIds.length > 1;

      if (childIndex === 0) {
        return [
          styles.firstChildStyle,
          {
            borderBottomLeftRadius: parentHasChildren ? 0 : UI_SIZES.radius.card,
            borderBottomRightRadius: parentHasChildren ? 0 : UI_SIZES.radius.card,
          },
        ];
      } else if (childIndex === childArray.length - 1) {
        return styles.lastChildStyle;
      } else if (childIndex > 0) {
        return styles.middleChildStyle;
      } else {
        return {};
      }
    };

    const rootLevelItemStyle = hasChild ? styles.listItemWithChild : styles.listItemChildless;
    const indentedItemStyle = getChildPositionStyle();

    return [rootLevelItemStyle, indentedItemStyle];
  }, [hasChild, props.id, props.parentId, props.wikiData.pages]);

  return (
    <View style={listItemStyle}>
      <TouchableOpacity onPress={props.onPress}>
        <BodyText>{props.name}</BodyText>
      </TouchableOpacity>
    </View>
  );
};

export const PageList = ({
  header,
  onPress,
  refreshControl,
  wikiData,
}: {
  wikiData: Wiki;
  header: React.ReactElement;
  onPress?: (page: WikiPage) => void;
  refreshControl: FlatListProps<WikiPage>['refreshControl'];
}) => {
  const renderPageList = React.useCallback(() => {
    return (
      <FlatList
        refreshControl={refreshControl}
        data={wikiData?.pages}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.spacingFolder} />}
        ListHeaderComponent={
          <View>
            {header}
            <PageListTitle />
          </View>
        }
        ListFooterComponent={
          <TertiaryButton
            style={styles.newPageButton}
            iconLeft="ui-plus"
            text={I18n.get('wiki-pagelist-newpage')}
            action={() => console.log('new page')}
          />
        }
        renderItem={({ item }) => (
          <WikiListItem
            key={item.id}
            depth={item.depth}
            isVisible={item.isVisible}
            name={item.title}
            onPress={() => {
              onPress?.(item);
            }}
            parentId={item.parentId}
            position={item.position}
            childrenIds={item.childrenIds}
            wikiData={wikiData}
            id={item.id}
          />
        )}
      />
    );
  }, [header, onPress, wikiData]);

  return renderPageList();
};
