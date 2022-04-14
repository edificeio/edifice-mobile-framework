import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { resourcesAdapter } from '~/modules/mediacentre/services/textbooks';
import { AdvancedSearchParams, Field } from '~/modules/mediacentre/components/AdvancedSearchModal';

const addFieldWhenFilled = (field: Field) => {
  return ({ 'value': field.value, 'operands': field.operand ? '$and' : '$or' });
}

export const searchService = {
  getGar: async () => {
    const jsondata = {
      event: 'search',
      state: 'PLAIN_TEXT',
      sources: [
        'fr.openent.mediacentre.source.GAR',
      ],
      data: {
        query: '.*',
      },
    };
    const reponse = await fetchJSONWithCache(`/mediacentre/search?jsondata=${JSON.stringify(jsondata)}`, {
      method: 'get',
    });
    return resourcesAdapter(reponse.data.resources);
  },
  getSimple: async (query: string) => {
    const jsondata = {
      event: 'search',
      state: 'PLAIN_TEXT',
      sources: [
        'fr.openent.mediacentre.source.GAR',
        'fr.openent.mediacentre.source.Moodle',
        'fr.openent.mediacentre.source.Signet',
      ],
      data: {
        query,
      },
    };
    const reponse = await fetchJSONWithCache(`/mediacentre/search?jsondata=${JSON.stringify(jsondata)}`, {
      method: 'get',
    });
    return resourcesAdapter(reponse.data.resources);
  },
  getAdvanced: async (params: AdvancedSearchParams) => {
    const fields = [params.title, params.authors, params.editors, params.disciplines, params.levels];
    let jsondata = {
      'event': 'search',
      'state': 'ADVANCED',
      'sources': [
        params.sources.GAR && 'fr.openent.mediacentre.source.GAR',
        params.sources.Moodle && 'fr.openent.mediacentre.source.Moodle',
        params.sources.Signets && 'fr.openent.mediacentre.source.Signet',
      ],
      'data': {}
    };
    fields.forEach(field => {
      if (field.value !== '') {
        jsondata.data[field.name] = addFieldWhenFilled(field);
      }
    });
    const reponse = await fetchJSONWithCache(`/mediacentre/search?jsondata=${JSON.stringify(jsondata)}`, {
      method: 'get',
    });
    return resourcesAdapter(reponse.data.resources);
  },
};
