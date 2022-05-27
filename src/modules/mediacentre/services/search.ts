import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { Field, Sources } from '~/modules/mediacentre/components/AdvancedSearchModal';
import { resourcesAdapter } from '~/modules/mediacentre/services/textbooks';

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
  getAdvanced: async (fields: Field[], checkedSources: Sources) => {
    const sources: string[] = [];
    const jsondata = {
      event: 'search',
      state: 'ADVANCED',
      sources,
      data: {},
    };
    addSource(jsondata.sources, checkedSources.GAR, 'GAR');
    addSource(jsondata.sources, checkedSources.Moodle, 'Moodle');
    addSource(jsondata.sources, checkedSources.PMB, 'PMB');
    addSource(jsondata.sources, checkedSources.Signet, 'Signet');
    for (const field of fields) {
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
