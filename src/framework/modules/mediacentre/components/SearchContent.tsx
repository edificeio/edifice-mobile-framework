import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { I18n } from '~/app/i18n';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/empty-screens';
import FlatList from '~/framework/components/list/flat-list';
import { LoadingIndicator } from '~/framework/components/loading';
import { Icon } from '~/framework/components/picture/Icon';
import { Resource, Source } from '~/framework/modules/mediacentre/model';

import { BigCard } from './BigCard';
import { SearchFilter } from './SearchFilter';

const styles = StyleSheet.create({
  parametersContainer: {
    marginHorizontal: UI_SIZES.spacing.medium,
    marginBottom: UI_SIZES.spacing.small,
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
    marginRight: UI_SIZES.spacing.small,
  },
  mainContainer: {
    flex: 1,
  },
  loadingIndicator: {
    marginTop: '45%',
  },
  filterContainer: {
    marginHorizontal: UI_SIZES.spacing.medium,
    marginBottom: UI_SIZES.spacing.small,
  },
});

export enum SearchState {
  NONE = 0,
  SIMPLE = 1,
}

interface ISearchFilters {
  level: string[];
  resourcetype: string[];
  source: string[];
}

interface ISources {
  GAR: boolean;
  Moodle: boolean;
  Signet: boolean;
}

interface ISearchParamsProps {
  searchState: SearchState;
  sources: ISources;
  onCancelSearch: () => void;
}

interface ISearchContentProps {
  isFetching: boolean;
  resources: Resource[];
  searchState: SearchState;
  addFavorite: (id: string, resource: Resource) => any;
  onCancelSearch: () => void;
  removeFavorite: (id: string, source: Source) => any;
}

const resourceMatchesFilters = (resource: Resource, filters: ISearchFilters) => {
  let typeMatches = filters.resourcetype.length === 0;
  let sourceMatches = filters.source.length === 0;
  let levelMatches = filters.level.length === 0;

  for (const type of filters.resourcetype) {
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

const getSources = (resources: Resource[]) => {
  return {
    GAR: resources.some(resource => resource.source === Source.GAR),
    Moodle: resources.some(resource => resource.source === Source.MOODLE),
    Signet: resources.some(resource => resource.source === Source.SIGNET),
  };
};

const SearchParams: React.FunctionComponent<ISearchParamsProps> = (props: ISearchParamsProps) => (
  <View style={styles.parametersContainer}>
    <View style={styles.upperContainer}>
      <View style={styles.sourcesContainer}>
        {props.sources.GAR ? <Image source={require('ASSETS/images/logo-gar.png')} style={styles.sourceImage} /> : null}
        {props.sources.Moodle ? <Image source={require('ASSETS/images/logo-moodle.png')} style={styles.sourceImage} /> : null}
        {props.sources.Signet ? <Icon name="bookmark_outline" size={24} /> : null}
      </View>
      <SecondaryButton text={I18n.get('common-cancel')} action={props.onCancelSearch} />
    </View>
  </View>
);

export const SearchContent: React.FunctionComponent<ISearchContentProps> = (props: ISearchContentProps) => {
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [activeFilters, setActiveFilters] = useState<ISearchFilters>({ resourcetype: [], source: [], level: [] });
  const isFiltering = activeFilters.resourcetype.length > 0 || activeFilters.source.length > 0 || activeFilters.level.length > 0;
  const sources = getSources(isFiltering ? filteredResources : props.resources);
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
  return (
    <View style={styles.mainContainer}>
      <SearchParams {...props} sources={sources} />
      {props.isFetching ? (
        <LoadingIndicator customStyle={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={isFiltering ? filteredResources : props.resources}
          renderItem={({ item }) => <BigCard {...props} resource={item} key={item.uid || item.id} />}
          keyExtractor={item => item.uid || item.id}
          ListHeaderComponent={
            props.resources.length ? (
              <SearchFilter resources={props.resources} onChange={onChange} containerStyle={styles.filterContainer} />
            ) : null
          }
          ListEmptyComponent={<EmptyScreen svgImage="empty-search" title={I18n.get('mediacentre-home-emptyscreen-search')} />}
        />
      )}
    </View>
  );
};
