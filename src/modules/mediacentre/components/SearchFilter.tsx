import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, ViewStyle,  } from 'react-native';
import I18n from 'i18n-js';

import theme from '~/app/theme';
import { Icon } from '~/ui';
import { Checkbox } from '~/ui/forms/Checkbox';
import { Text } from '~/ui/Typography';

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
  sectionContainer: {
    paddingVertical: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
});

const DATA = [
  {
    title: "Type de ressource",
    items: [
      { name: "Pizza", checked: true },
      { name: "Burger", checked: false },
      { name: "Risotto", checked: true }
    ]
  },
  {
    title: "Tout type de source",
    items: [
      { name: "French Fries", checked: true },
      { name: "Onion Rings", checked: true }
    ]
  },
  {
    title: "Niveau",
    items: [
      { name: "Water", checked: true },
      { name: "Coke", checked: true }
    ]
  }
];

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
  buttons: string[];
  containerStyle?: ViewStyle;
}

const FilterSection: React.FunctionComponent<FilterSectionProps> = (props: FilterSectionProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const iconName = expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  return (
    <View>
      <TouchableOpacity style={styles.sectionContainer} onPress={() => setExpanded(!expanded)}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text>{props.title}</Text>
          <Icon name={iconName} size={30} />
        </View>
        <View style={{ height: 1, backgroundColor: '#e2e2e299' }} />
      </TouchableOpacity>
      {expanded ? props.items.map((item) => <FilterItem name={item.name} checked={item.checked} setChecked={() => true} />) : null}
    </View>
  )
}

const FilterItem: React.FunctionComponent<FilterItemProps> = (props: FilterItemProps) => (
  <View style={styles.itemContainer}>
    <Checkbox checked={props.checked} onCheck={() => props.setChecked(true)} onUncheck={() => props.setChecked(false)} />
    <TouchableOpacity onPress={() => props.setChecked(!props.checked)} style={{ flex: 1, marginLeft: 5 }}>
      <Text>{props.name}</Text>
    </TouchableOpacity>
  </View>
);

export const SearchFilter: React.FunctionComponent<SearchFilterProps> = (props: SearchFilterProps) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  return (
    <View style={[styles.mainContainer, props.containerStyle]}>
      <TouchableOpacity style={styles.titleContainer} onPress={() => setExpanded(!expanded)}>
        <Text>{I18n.t('mediacentre.filter-search').toUpperCase()}</Text>
      </TouchableOpacity>
      {expanded ?
        <FlatList
          data={DATA}
          keyExtractor={(item, index) => item.title + index}
          renderItem={({ item }) => <FilterSection title={item.title} items={item.items} />}
        />
      : null}
    </View>
  )
};
