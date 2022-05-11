import I18n from 'i18n-js';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { Resource } from '~/modules/mediacentre/utils/Resource';
import { Icon } from '~/ui';
import { Text } from '~/ui/Typography';
import { Checkbox } from '~/ui/forms/Checkbox';

const styles = StyleSheet.create({
  mainContainer: {
    padding: 10,
    borderColor: 'lightgrey',
    backgroundColor: theme.color.background.card,
    borderRadius: 15,
    shadowColor: theme.color.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  itemTextContainer: {
    flex: 1,
    marginLeft: 5,
  },
  sectionContainer: {
    paddingVertical: 5,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionUnderlineView: {
    height: 1,
    backgroundColor: '#e2e2e299',
  },
});

interface FilterItemProps {
  item: { value: string; active: boolean };
  sectionTitle: string;

  onChange: (title: string, item: string, active: boolean) => void;
}

interface FilterSectionProps {
  items: any[];
  title: string;

  onChange: (title: string, item: string, active: boolean) => void;
}

interface SearchFilterProps {
  containerStyle?: ViewStyle;
  resources: Resource[];

  onChange: (title: string, item: string, active: boolean) => void;
}

const compareFilters = (a: { value: string; active: boolean }, b: { value: string; active: boolean }) => {
  return a.value.toLowerCase() > b.value.toLowerCase() ? 1 : -1;
};

const getFilters = (resources: Resource[]) => {
  const types: { value: string; active: boolean }[] = [];
  const sources: { value: string; active: boolean }[] = [];
  const levels: { value: string; active: boolean }[] = [];
  for (const resource of resources) {
    const source = resource.source.substring(30);
    for (const type of resource.types) {
      if (!types.some(({ value }) => value === type)) {
        types.push({ value: type, active: false });
      }
    }
    if (!sources.some(({ value }) => value === source)) {
      sources.push({ value: source, active: false });
    }
    for (const level of resource.levels) {
      if (!levels.some(({ value }) => value === level)) {
        levels.push({ value: level, active: false });
      }
    }
  }
  return [
    { title: 'resource-type', items: types.sort(compareFilters) },
    { title: 'source', items: sources.sort(compareFilters) },
    { title: 'level', items: levels.sort(compareFilters) },
  ];
};

const FilterItem: React.FunctionComponent<FilterItemProps> = (props: FilterItemProps) => {
  const check = () => {
    props.onChange(props.sectionTitle, props.item.value, !props.item.active);
  };
  return (
    <View style={styles.itemContainer}>
      <Checkbox checked={props.item.active} onCheck={check} onUncheck={check} />
      <TouchableOpacity onPress={check} style={styles.itemTextContainer}>
        <Text>{props.item.value}</Text>
      </TouchableOpacity>
    </View>
  );
};

const FilterSection: React.FunctionComponent<FilterSectionProps> = (props: FilterSectionProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const iconName = expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  const expandSection = () => {
    setExpanded(!expanded);
  };
  return (
    <View>
      <TouchableOpacity style={styles.sectionContainer} onPress={expandSection}>
        <View style={styles.sectionHeaderContainer}>
          <Text>{I18n.t(`mediacentre.${props.title}`)}</Text>
          <Icon name={iconName} size={30} />
        </View>
        <View style={styles.sectionUnderlineView} />
      </TouchableOpacity>
      {expanded ? props.items.map(item => <FilterItem {...props} item={item} sectionTitle={props.title} key={item.value} />) : null}
    </View>
  );
};

export const SearchFilter: React.FunctionComponent<SearchFilterProps> = (props: SearchFilterProps) => {
  const [filters, setFilters] = useState(getFilters(props.resources));
  const [expanded, setExpanded] = useState<boolean>(false);
  const expand = () => {
    setExpanded(!expanded);
  };
  const onChange = (title: string, item: string, active: boolean) => {
    props.onChange(title, item, active);
    const filter = filters.find(x => x.title === title);
    if (filter) {
      const index = filters.indexOf(filter);
      filters[index].items = filters[index].items.map(i => (i.value === item ? { value: item, active } : i));
      setFilters(filters);
    }
  };
  return (
    <View style={[styles.mainContainer, props.containerStyle]}>
      <TouchableOpacity style={styles.titleContainer} onPress={expand}>
        <Icon name="filter" size={16} style={styles.iconContainer} />
        <Text>{I18n.t('mediacentre.filter').toUpperCase()}</Text>
      </TouchableOpacity>
      {expanded ? (
        <FlatList
          data={filters}
          keyExtractor={(item, index) => item.title + index}
          renderItem={({ item }) => <FilterSection title={item.title} items={item.items} onChange={onChange} />}
        />
      ) : null}
    </View>
  );
};
