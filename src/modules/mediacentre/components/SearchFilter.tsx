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
    alignItems: 'center',
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

interface FilterSectionProps {
  items: any[];
  title: string;
}

interface FilterItemProps {
  checked: boolean;
  name: string;

  setChecked: (value: boolean) => void;
}

interface SearchFilterProps {
  containerStyle?: ViewStyle;
  resources: Resource[];

  onChange: (resources: Resource[]) => void;
}

const getFilters = (resources: Resource[]) => {
  const types: string[] = [];
  const sources: string[] = [];
  const levels: string[] = [];
  for (const resource of resources) {
    for (const type of resource.types) {
      if (!types.includes(type)) {
        types.push(type);
      }
    }
    if (!sources.includes(resource.source)) {
      sources.push(resource.source);
    }
    for (const level of resource.levels) {
      if (!levels.includes(level)) {
        levels.push(level);
      }
    }
  }
  return [
    { title: 'resource-type', items: types },
    { title: 'source', items: sources },
    { title: 'level', items: levels },
  ];
};

const FilterItem: React.FunctionComponent<FilterItemProps> = (props: FilterItemProps) => {
  const setChecked = () => {
    props.setChecked(!props.checked);
  };
  return (
    <View style={styles.itemContainer}>
      <Checkbox checked={props.checked} onCheck={setChecked} onUncheck={setChecked} />
      <TouchableOpacity onPress={setChecked} style={styles.itemTextContainer}>
        <Text>{props.name}</Text>
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
      {expanded ? props.items.map(item => <FilterItem name={item} checked={false} setChecked={() => true} />) : null}
    </View>
  );
};

export const SearchFilter: React.FunctionComponent<SearchFilterProps> = (props: SearchFilterProps) => {
  const [filters] = useState(getFilters(props.resources));
  const [expanded, setExpanded] = useState<boolean>(false);
  const expand = () => {
    setExpanded(!expanded);
  };
  return (
    <View style={[styles.mainContainer, props.containerStyle]}>
      <TouchableOpacity style={styles.titleContainer} onPress={expand}>
        <Text>{I18n.t('mediacentre.filter-search').toUpperCase()}</Text>
      </TouchableOpacity>
      {expanded ? (
        <FlatList
          data={filters}
          keyExtractor={(item, index) => item.title + index}
          renderItem={({ item }) => <FilterSection title={item.title} items={item.items} />}
        />
      ) : null}
    </View>
  );
};
