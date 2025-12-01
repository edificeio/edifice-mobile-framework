import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { Resource, Source } from '~/framework/modules/mediacentre/model';
import { resourceAdapter } from '~/framework/modules/mediacentre/service/adapters';
import { BackendGlobalResources, BackendResource, BackendSearch } from '~/framework/modules/mediacentre/service/types';
import { fetchJSONWithCache, signedFetch } from '~/infra/fetchWithCache';

export const mediacentreService = {
  favorites: {
    add: async (session: AuthActiveAccount, resource: Resource) => {
      const api = `/mediacentre/favorites?id=${resource.id}`;
      return signedFetch(`${session.platform.url}${api}`, {
        body: JSON.stringify({
          ...resource,
          id: resource.source === Source.SIGNET ? Number(resource.id) : resource.id,
        }),
        method: 'POST',
      }) as Promise<any>;
    },
    get: async (session: AuthActiveAccount) => {
      const api = '/mediacentre/favorites';
      const { data: favorites } = (await fetchJSONWithCache(api)) as { data: BackendResource[] };
      if (!Array.isArray(favorites)) return [];
      return favorites.map(resourceAdapter);
    },
    remove: async (session: AuthActiveAccount, id: string, source: Source) => {
      const api = `/mediacentre/favorites?id=${id}&source=${source}`;
      return signedFetch(`${session.platform.url}${api}`, {
        method: 'DELETE',
      }) as Promise<any>;
    },
  },
  globalResources: {
    get: async (session: AuthActiveAccount) => {
      const api = '/mediacentre/global/resources';
      const response = (await fetchJSONWithCache(api)) as BackendGlobalResources;
      if (response.status !== 'ok') return [];
      return response.data.global.map(resourceAdapter);
    },
  },
  pins: {
    get: async (session: AuthActiveAccount, structureId: string) => {
      const api = `/mediacentre/structures/${structureId}/pins`;
      const resources = (await fetchJSONWithCache(api)) as BackendResource[];
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
      const response = (await fetchJSONWithCache(api)) as BackendSearch;
      return response
        .filter(r => r.status === 'ok')
        .flatMap(s => [...s.data.resources])
        .map(resourceAdapter);
    },
  },
  selectedStructure: {
    get: async (session: AuthActiveAccount) => {
      const api = `/userbook/preference/selectedStructure`;
      const { preference } = (await fetchJSONWithCache(api)) as { preference?: string };
      if (!preference) return null;
      return preference.replaceAll('"', '');
    },
    update: async (session: AuthActiveAccount, id: string) => {
      const api = `/userbook/preference/selectedStructure`;
      return signedFetch(`${session.platform.url}${api}`, {
        body: JSON.stringify(id),
        method: 'PUT',
      }) as Promise<any>;
    },
  },
  signets: {
    get: async (session: AuthActiveAccount) => {
      const response = (await fetchJSONWithCache('/mediacentre/signets')) as {
        data: {
          signets: {
            resources: BackendResource[];
          };
        };
      };
      const signets = response.data.signets.resources;
      const mysignets = (await fetchJSONWithCache('/mediacentre/mysignets')) as BackendResource[];
      return signets
        .concat(mysignets.filter(ms => !signets.some(s => s.id === ms.id.toString()) && !ms.archived))
        .map(resourceAdapter);
    },
  },
  textbooks: {
    get: async (session: AuthActiveAccount, structureId: string) => {
      const api = `/mediacentre/textbooks/refresh?structureIds=${structureId}`;
      const response = (await fetchJSONWithCache(api)) as {
        data: {
          textbooks: BackendResource[];
        };
      };
      return response.data.textbooks.map(resourceAdapter);
    },
  },
};
