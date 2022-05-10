import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { AdvancedSearchParams, Field } from '~/modules/mediacentre/components/AdvancedSearchModal';
import { resourcesAdapter } from '~/modules/mediacentre/services/textbooks';

import { Source } from '../utils/Resource';

const concatResources = (response: any) => {
  let resources: any[] = [];
  for (const res of response) {
    if (res.data && res.data.resources) {
      resources = resources.concat(res.data.resources);
    }
  }
  return resources;
};

const addFieldWhenFilled = (field: Field) => {
  return { value: field.value, comparator: field.operand ? '$and' : '$or' };
};

const addSource = (sources: string[], value: boolean, name: string) => {
  if (value) {
    sources.push(`fr.openent.mediacentre.source.${name}`);
  }
};

export const searchService = {
  getExternals: async (sources: string[]) => {
    const jsondata = {
      event: 'search',
      state: 'PLAIN_TEXT',
      sources: sources.filter(source => source !== Source.Signet),
      data: {
        query: '.*',
      },
    };
    const response = await fetchJSONWithCache(`/mediacentre/search?jsondata=${JSON.stringify(jsondata)}`, {
      method: 'get',
    });
    return resourcesAdapter(concatResources(response));
  },
  getSimple: async (sources: string[], query: string) => {
    const jsondata = {
      event: 'search',
      state: 'PLAIN_TEXT',
      sources,
      data: {
        query,
      },
    };
    const response = await fetchJSONWithCache(`/mediacentre/search?jsondata=${JSON.stringify(jsondata)}`, {
      method: 'get',
    });
    return resourcesAdapter(concatResources(response));
  },
  getAdvanced: async (params: AdvancedSearchParams) => {
    const sources: string[] = [];
    const jsondata = {
      event: 'search',
      state: 'ADVANCED',
      sources,
      data: {},
    };
    addSource(jsondata.sources, params.sources.GAR, 'GAR');
    addSource(jsondata.sources, params.sources.Moodle, 'Moodle');
    addSource(jsondata.sources, params.sources.PMB, 'PMB');
    addSource(jsondata.sources, params.sources.Signets, 'Signet');
    for (const field of params.fields) {
      if (field.value !== '') {
        jsondata.data[field.name] = addFieldWhenFilled(field);
      }
    }
    const response = await fetchJSONWithCache(`/mediacentre/search?jsondata=${JSON.stringify(jsondata)}`, {
      method: 'get',
    });
    return resourcesAdapter(concatResources(response));
  },
};
