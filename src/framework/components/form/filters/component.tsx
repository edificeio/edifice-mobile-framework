import * as React from 'react';

import { styles } from './styles';
import { BaseFilter, FiltersListProps } from './types';

import CheckboxButton from '~/framework/components/buttons/checkbox';
import FlatList from '~/framework/components/list/flat-list';
import { BodyBoldText, BodyText } from '~/framework/components/text';

const MERGED_STYLES = {
  active: { ...styles.listItem, ...styles.itemActive },
  inactive: { ...styles.listItem, ...styles.itemInactive },
};

const FiltersList = <T extends BaseFilter>({ onChange, options, title }: FiltersListProps<T>) => {
  const FiltersListTitle = <BodyBoldText>{title}</BodyBoldText>;

  const handleItemPress = React.useCallback(
    (filterName: string) => {
      onChange(prevFilters =>
        prevFilters.map(filter => (filter.name === filterName ? { ...filter, isActive: !filter.isActive } : filter)),
      );
    },
    [onChange],
  );

  const onItemPress = React.useMemo(() => options.map(item => () => handleItemPress(item.name)), [options, handleItemPress]);
  const handleKeyExtraction = React.useCallback((item: T) => item.id.toString(), []);

  const renderFilterItem = React.useCallback(
    ({ index, item }) => {
      return (
        <CheckboxButton
          checked={item.isActive}
          customListItemStyle={item.isActive ? MERGED_STYLES.active : MERGED_STYLES.inactive}
          onPress={onItemPress[index]}
          TextComponent={BodyText}
          title={item.name}
        />
      );
    },
    [onItemPress],
  );

  return (
    <FlatList
      bottomInset={false}
      contentContainerStyle={styles.content}
      data={options}
      keyExtractor={handleKeyExtraction}
      ListHeaderComponent={FiltersListTitle}
      ListHeaderComponentStyle={styles.listTitle}
      renderItem={renderFilterItem}
    />
  );
};

export default FiltersList;
