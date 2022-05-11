import I18n from 'i18n-js';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { Resource, Source } from '~/modules/mediacentre/utils/Resource';
import { Icon } from '~/ui';
import { DialogButtonOk } from '~/ui/ConfirmDialog';
import { Text, TextBold } from '~/ui/Typography';

import { AdvancedSearchParams, Field } from './AdvancedSearchModal';
import { BigCard } from './BigCard';
import { SearchState } from './HomePage';
import { SearchFilter } from './SearchFilter';

const styles = StyleSheet.create({
  fieldContainer: {
    flexDirection: 'row',
    marginRight: 10,
  },
  parametersContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  upperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourcesContainer: {
    flexDirection: 'row',
  },
  sourceImage: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: theme.color.secondary.regular,
  },
  fieldsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  mainContainer: {
    flex: 1,
  },
  filterContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
});

interface SearchFilters {
  level: string[];
  'resource-type': string[];
  source: string[];
}

interface AdvancedSearchFieldProps {
  field: Field;
}

interface SearchParamsProps {
  params: AdvancedSearchParams;
  searchState: SearchState;

  onCancelSearch: () => void;
}

interface SearchContentProps {
  params: AdvancedSearchParams;
  resources: Resource[];
  searchState: SearchState;

  addFavorite: (id: string, resource: Resource) => any;
  onCancelSearch: () => void;
  removeFavorite: (id: string, source: Source) => any;
}

const resourceMatchesFilters = (resource: Resource, filters: SearchFilters) => {
  let typeMatches = filters['resource-type'].length === 0;
  let sourceMatches = filters.source.length === 0;
  let levelMatches = filters.level.length === 0;

  for (const type of filters['resource-type']) {
    if (resource.types.includes(type)) {
      typeMatches = true;
    }
  }
  if (filters.source.includes(resource.source.substring(30))) {
    sourceMatches = true;
  }
  for (const level of filters.level) {
    if (resource.levels.includes(level)) {
      levelMatches = true;
    }
  }
  return typeMatches && sourceMatches && levelMatches;
};

const AdvancedSearchField: React.FunctionComponent<AdvancedSearchFieldProps> = (props: AdvancedSearchFieldProps) =>
  props.field.value !== '' ? (
    <View style={styles.fieldContainer}>
      <TextBold>{I18n.t(`mediacentre.advancedSearch.${props.field.name}`)}</TextBold>
      <Text numberOfLines={1}> {props.field.value}</Text>
    </View>
  ) : null;

const SearchParams: React.FunctionComponent<SearchParamsProps> = (props: SearchParamsProps) => (
  <View style={styles.parametersContainer}>
    <View style={styles.upperContainer}>
      <View style={styles.sourcesContainer}>
        {props.params.sources.GAR ? <Image source={require('ASSETS/images/logo-gar.png')} style={styles.sourceImage} /> : null}
        {props.params.sources.Moodle ? (
          <Image source={require('ASSETS/images/logo-moodle.png')} style={styles.sourceImage} />
        ) : null}
        {props.params.sources.PMB ? <Image source={require('ASSETS/images/logo-pmb.png')} style={styles.sourceImage} /> : null}
        {props.params.sources.Signets ? <Icon name="bookmark_outline" size={24} /> : null}
      </View>
      <DialogButtonOk style={styles.cancelButton} label={I18n.t('common.cancel')} onPress={props.onCancelSearch} />
    </View>
    {props.searchState === SearchState.ADVANCED ? (
      <View style={styles.fieldsContainer}>
        {props.params.fields.map((field, index) => (
          <AdvancedSearchField field={field} key={index} />
        ))}
      </View>
    ) : null}
  </View>
);

export const SearchContent: React.FunctionComponent<SearchContentProps> = (props: SearchContentProps) => {
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({ 'resource-type': [], source: [], level: [] });
  const isFiltering =
    activeFilters['resource-type'].length > 0 || activeFilters.source.length > 0 || activeFilters.level.length > 0;
  const filterResources = () => {
    const filtered: Resource[] = [];
    for (const resource of props.resources) {
      if (resourceMatchesFilters(resource, activeFilters)) {
        filtered.push(resource);
      }
    }
    setFilteredResources(filtered);
  };
  const onChange = (title: string, item: string, active: boolean) => {
    const index = activeFilters[title].indexOf(item);
    if (active) {
      activeFilters[title].push(item);
    } else if (index !== -1) {
      activeFilters[title].splice(index, 1);
    }
    setActiveFilters(activeFilters);
    filterResources();
  };
  const sources = {
    GAR: props.resources.some(resource => resource.source === Source.GAR),
    Moodle: props.resources.some(resource => resource.source === Source.Moodle),
    PMB: props.resources.some(resource => resource.source === Source.PMB),
    Signets: props.resources.some(resource => resource.source === Source.Signet),
  };
  return (
    <View style={styles.mainContainer}>
      <SearchParams {...props} params={{ ...props.params, sources }} />
      <FlatList
        data={isFiltering ? filteredResources : props.resources}
        renderItem={({ item }) => <BigCard {...props} resource={item} key={item.uid || item.id} />}
        keyExtractor={item => item.uid || item.id}
        ListHeaderComponent={
          props.resources.length ? (
            <SearchFilter resources={props.resources} onChange={onChange} containerStyle={styles.filterContainer} />
          ) : null
        }
        ListEmptyComponent={<EmptyScreen svgImage="empty-mediacentre" title={I18n.t('mediacentre.empty-search')} />}
      />
    </View>
  );
};
