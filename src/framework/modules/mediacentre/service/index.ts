import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { Resource, Source } from '~/framework/modules/mediacentre/model';
import { resourceAdapter } from '~/framework/modules/mediacentre/service/adapters';
import {
  BackendGlobalResources,
  BackendResource,
  BackendSearch,
  BackendSignetsResourcesType,
  BackendTextBooksType,
} from '~/framework/modules/mediacentre/service/types';
import { sessionFetch } from '~/framework/util/transport';

export const mediacentreService = {
  favorites: {
    add: async (session: AuthActiveAccount, resource: Resource) => {
      const api = `/mediacentre/favorites?id=${resource.id}`;
      return sessionFetch.json<any>(api, {
        body: JSON.stringify({
          ...resource,
          id: resource.source === Source.SIGNET ? Number(resource.id) : resource.id,
        }),
        method: 'POST',
      });
    },
    get: async (session: AuthActiveAccount) => {
      const api = '/mediacentre/favorites';
      const { data: favorites } = await sessionFetch.json<{ data: BackendResource[] }>(api);
      if (!Array.isArray(favorites)) return [];
      return favorites.map(resourceAdapter);
    },
    remove: async (session: AuthActiveAccount, id: string, source: Source) => {
      const api = `/mediacentre/favorites?id=${id}&source=${source}`;
      return sessionFetch(api, { method: 'DELETE' });
    },
  },
  globalResources: {
    get: async (session: AuthActiveAccount) => {
      const api = '/mediacentre/global/resources';
      const response = await sessionFetch.json<BackendGlobalResources>(api);
      if (response.status !== 'ok') return [];
      return response.data.global.map(resourceAdapter);
    },
  },
  pins: {
    get: async (session: AuthActiveAccount, structureId: string) => {
      const api = `/mediacentre/structures/${structureId}/pins`;
      const resources = await sessionFetch.json<BackendResource[]>(api);
      return resources.map(resourceAdapter);
    },
  },
  search: {
    getSimple: async (session: AuthActiveAccount, sources: Source[], query: string) => {
      const jsondata = {
        data: {
          query,
        },
        event: 'search',
        sources,
        state: 'PLAIN_TEXT',
      };
      const api = `/mediacentre/search?jsondata=${JSON.stringify(jsondata)}`;
      const response = await sessionFetch.json<BackendSearch>(api);
      return response
        .filter(r => r.status === 'ok')
        .flatMap(s => [...s.data.resources])
        .map(resourceAdapter);
    },
  },
  selectedStructure: {
    get: async (session: AuthActiveAccount) => {
      const api = `/userbook/preference/selectedStructure`;
      const { preference } = await sessionFetch.json<{ preference?: string }>(api);
      if (!preference) return null;
      return preference.replaceAll('"', '');
    },
    update: async (session: AuthActiveAccount, id: string) => {
      const api = `/userbook/preference/selectedStructure`;
      return sessionFetch(api, { body: JSON.stringify(id), method: 'PUT' });
    },
  },
  signets: {
    get: async (session: AuthActiveAccount) => {
      const api = '/mediacentre/signets';
      const mySignetsApi = '/mediacentre/mysignets';
      const response = await sessionFetch.json<BackendSignetsResourcesType>(api);
      const signets = response.data.signets.resources;
      const mysignets = await sessionFetch.json<BackendResource[]>(mySignetsApi);
      return signets
        .concat(mysignets.filter(ms => !signets.some(s => s.id === ms.id.toString()) && !ms.archived))
        .map(resourceAdapter);
    },
  },
  textbooks: {
    get: async (session: AuthActiveAccount, structureId: string) => {
      const api = `/mediacentre/textbooks/refresh?structureIds=${structureId}`;
      const response = await sessionFetch.json<BackendTextBooksType>(api);
      return response.data.textbooks.map(resourceAdapter);
    },
  },
};
