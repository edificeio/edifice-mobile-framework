import React from 'react';
import { View } from 'react-native';

import FilterButton from './filter-button';
import styles from './styles';
import { ResourceFilterListProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { NamedSVG } from '~/framework/components/picture';
import { ResourceFilter } from '~/framework/modules/mediacentre/model';

const ResourceFilterList: React.FunctionComponent<ResourceFilterListProps> = ({
  filters,
  onChange,
  openFilter,
  showThemeFilters = true,
}) => {
  const hasFilter = Object.values(filters).some(v => v.length >= 2);

  const handleChangeSources = (sources: ResourceFilter[]) => onChange({ ...filters, sources });

  const handleChangeTypes = (types: ResourceFilter[]) => onChange({ ...filters, types });

  const handleChangeThemes = (themes: ResourceFilter[]) => onChange({ ...filters, themes });

  const handleChangeLevels = (levels: ResourceFilter[]) => onChange({ ...filters, levels });

  const handleChangeDisciplines = (disciplines: ResourceFilter[]) => onChange({ ...filters, disciplines });

  return (
    <View style={styles.mainContainer}>
      {hasFilter ? <NamedSVG name="ui-filter" width={20} height={20} fill={theme.ui.text.regular} /> : null}
      {filters.sources.length > 1 ? (
        <FilterButton
          text={I18n.get('mediacentre-resourcelist-filter-sources')}
          action={() =>
            openFilter({
              filters: filters.sources,
              onChange: handleChangeSources,
              title: I18n.get('mediacentre-resourcelist-filter-sources'),
            })
          }
        />
      ) : null}
      {filters.types.length > 1 ? (
        <FilterButton
          text={I18n.get('mediacentre-resourcelist-filter-types')}
          action={() =>
            openFilter({
              filters: filters.types,
              onChange: handleChangeTypes,
              title: I18n.get('mediacentre-resourcelist-filter-types'),
            })
          }
        />
      ) : null}
      {filters.themes.length > 1 && showThemeFilters ? (
        <FilterButton
          text={I18n.get('mediacentre-resourcelist-filter-themes')}
          action={() =>
            openFilter({
              filters: filters.themes,
              onChange: handleChangeThemes,
              title: I18n.get('mediacentre-resourcelist-filter-themes'),
            })
          }
        />
      ) : null}
      {filters.levels.length > 1 ? (
        <FilterButton
          text={I18n.get('mediacentre-resourcelist-filter-levels')}
          action={() =>
            openFilter({
              filters: filters.levels,
              onChange: handleChangeLevels,
              title: I18n.get('mediacentre-resourcelist-filter-levels'),
            })
          }
        />
      ) : null}
      {filters.disciplines.length > 1 ? (
        <FilterButton
          text={I18n.get('mediacentre-resourcelist-filter-disciplines')}
          action={() =>
            openFilter({
              filters: filters.disciplines,
              onChange: handleChangeDisciplines,
              title: I18n.get('mediacentre-resourcelist-filter-disciplines'),
            })
          }
        />
      ) : null}
    </View>
  );
};

export default ResourceFilterList;
